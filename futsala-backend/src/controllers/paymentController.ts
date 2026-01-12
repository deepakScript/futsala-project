// Payment Controller
import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import crypto from 'crypto';
// Import PaymentStatus from Prisma generated types
import { PaymentStatus } from '@prisma/client';


// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: string;
  };
}



// Payment method - only Khalti supported
const PAYMENT_METHOD = 'KHALTI';
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || 'https://a.khalti.com/api/v2';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '97fbe616f94b4b0cab1a443dfa116206'; // Demo secret

/**
 * Initiate a payment
 * @route POST /initiate
 */
export const initiatePayment = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { bookingId, return_url } = req.body as { bookingId: string, return_url?: string };

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: {
          include: {
            venue: true
          }
        },
        user: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Generate unique transaction reference for purchase_order_id
    const purchaseOrderId = `ORDER-${Date.now()}`;

    // Prepare Khalti payment gateway data
    const requestBody = {
      return_url: return_url || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment/success`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:5000',
      amount: Math.round(booking.totalPrice * 100), // Khalti expects amount in paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Booking for ${booking.court.venue.name} - ${booking.court.name}`,
      customer_info: {
        name: booking.user.fullName,
        email: booking.user.email,
        phone: booking.user.phoneNumber
      }
    };

    console.log('[Khalti] Initiating payment for booking:', bookingId);

    const khaltiResponse = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const khaltiData = await khaltiResponse.json() as any;

    if (!khaltiResponse.ok) {
      console.error('[Khalti] Initiation failed:', khaltiData);
      return res.status(khaltiResponse.status).json({
        success: false,
        message: 'Failed to initiate Khalti payment',
        error: khaltiData
      });
    }

    // Create or update payment record with pidx
    const payment = await prisma.payment.upsert({
      where: { bookingId: bookingId },
      update: {
        amount: booking.totalPrice,
        transactionId: khaltiData.pidx, // Store pidx in transactionId field initially
        status: PaymentStatus.PENDING
      },
      create: {
        bookingId: bookingId,
        amount: booking.totalPrice,
        paymentMethod: PAYMENT_METHOD,
        transactionId: khaltiData.pidx,
        status: PaymentStatus.PENDING
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        paymentId: payment.id,
        pidx: khaltiData.pidx,
        payment_url: khaltiData.payment_url,
        amount: booking.totalPrice,
        purchase_order_id: purchaseOrderId
      }
    });
  } catch (error) {
    console.error('[Payment Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Verify payment after completion
 * @route POST /verify
 */
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { pidx } = req.body as { pidx: string };

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: 'pidx is required for verification'
      });
    }

    console.log('[Khalti] Verifying payment for pidx:', pidx);

    const khaltiResponse = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pidx })
    });

    const khaltiData = await khaltiResponse.json() as any;

    if (!khaltiResponse.ok) {
      console.error('[Khalti] Verification lookup failed:', khaltiData);
      return res.status(khaltiResponse.status).json({
        success: false,
        message: 'Failed to verify payment with Khalti',
        error: khaltiData
      });
    }

    // Possible statuses: 'Completed', 'Pending', 'User cancelled', 'Expired', 'Refunded'
    if (khaltiData.status !== 'Completed') {
      return res.status(200).json({
        success: false,
        message: `Payment status is ${khaltiData.status}`,
        data: khaltiData
      });
    }

    // Update payment record and booking in a transaction
    const updatedPayment = await prisma.$transaction(async (tx) => {
      // Find payment by pidx (stored in transactionId)
      const payment = await tx.payment.findFirst({
        where: { transactionId: pidx }
      });

      if (!payment) {
        throw new Error('Payment record not found for this pidx');
      }

      // Update payment
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          // We can store the final transaction_id from Khalti if they provide it in lookup
          // For now we keep the pidx or updating it if needed
        }
      });

      // Update booking
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: 'CONFIRMED' as any
        }
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: userId,
          title: 'Payment Successful',
          message: `Your payment of NPR ${payment.amount} for pidx ${pidx} has been confirmed.`,
          type: 'PAYMENT',
          isRead: false
        }
      });

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('[Verify Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * View user payment history
 * @route GET /history
 */
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          userId: userId
        }
      },
      include: {
        booking: {
          include: {
            court: {
              include: {
                venue: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const totalAmount = payments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.amount, 0);

    const completedCount = payments.filter(p => p.status === PaymentStatus.PAID).length;
    const pendingCount = payments.filter(p => p.status === PaymentStatus.PENDING).length;
    const failedCount = payments.filter(p => p.status === PaymentStatus.FAILED).length;

    return res.status(200).json({
      success: true,
      count: payments.length,
      statistics: {
        totalAmount: totalAmount,
        completed: completedCount,
        pending: pendingCount,
        failed: failedCount
      },
      data: payments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};