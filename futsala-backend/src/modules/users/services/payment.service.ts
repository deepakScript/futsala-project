/* eslint-disable @typescript-eslint/no-explicit-any */
import { paymentRepository } from '../repositories/payment.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

const PAYMENT_METHOD = 'KHALTI';
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || 'https://a.khalti.com/api/v2';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '97fbe616f94b4b0cab1a443dfa116206';

export class PaymentService {
  async initiatePayment(userId: string, bookingId: string, returnUrl?: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    if (!bookingId) {
      throw new AppError('Booking ID is required', 400, ErrorCode.BAD_REQUEST);
    }

    const booking = await paymentRepository.findBookingForPayment(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404, ErrorCode.BOOKING_NOT_FOUND);
    }

    const purchaseOrderId = `ORDER-${Date.now()}`;
    const requestBody = {
      return_url:
        returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment/success`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:5000',
      amount: Math.round(booking.totalPrice * 100),
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Booking for ${booking.court.venue.name} - ${booking.court.name}`,
      customer_info: {
        name: booking.user.fullName,
        email: booking.user.email,
        phone: booking.user.phoneNumber,
      },
    };

    const khaltiResponse = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const khaltiData = (await khaltiResponse.json()) as any;
    if (!khaltiResponse.ok) {
      throw new AppError(
        'Failed to initiate Khalti payment',
        khaltiResponse.status,
        ErrorCode.PAYMENT_FAILED,
        khaltiData
      );
    }

    const payment = await paymentRepository.upsertPayment(
      bookingId,
      booking.totalPrice,
      khaltiData.pidx,
      PAYMENT_METHOD
    );

    return {
      paymentId: payment.id,
      pidx: khaltiData.pidx,
      payment_url: khaltiData.payment_url,
      amount: booking.totalPrice,
      purchase_order_id: purchaseOrderId,
    };
  }

  async verifyPayment(userId: string, pidx: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    if (!pidx) {
      throw new AppError('pidx is required for verification', 400, ErrorCode.BAD_REQUEST);
    }

    const khaltiResponse = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    const khaltiData = (await khaltiResponse.json()) as any;
    if (!khaltiResponse.ok) {
      throw new AppError(
        'Failed to verify payment with Khalti',
        khaltiResponse.status,
        ErrorCode.PAYMENT_FAILED,
        khaltiData
      );
    }

    if (khaltiData.status !== 'Completed') {
      return {
        verified: false,
        message: `Payment status is ${khaltiData.status}`,
        data: khaltiData,
      };
    }

    const payment = await paymentRepository.findByTransactionId(pidx);
    if (!payment) {
      throw new AppError('Payment record not found for this pidx', 404, ErrorCode.NOT_FOUND);
    }

    const updatedPayment = await paymentRepository.verifyAndUpdatePayment(
      payment.id,
      payment.bookingId,
      userId,
      payment.amount,
      pidx
    );

    return { verified: true, payment: updatedPayment };
  }

  async getPaymentHistory(userId: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const payments = await paymentRepository.findUserPaymentHistory(userId);
    const totalAmount = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      count: payments.length,
      statistics: {
        totalAmount,
        completed: payments.filter((p) => p.status === 'PAID').length,
        pending: payments.filter((p) => p.status === 'PENDING').length,
        failed: payments.filter((p) => p.status === 'FAILED').length,
      },
      payments,
    };
  }
}

export const paymentService = new PaymentService();
