import prisma from '../../../config/prismaClient';
import { PaymentStatus } from '@prisma/client';

export class PaymentRepository {
  async findBookingForPayment(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: { include: { venue: true } },
        user: true,
      },
    });
  }

  async upsertPayment(
    bookingId: string,
    amount: number,
    transactionId: string,
    paymentMethod: string,
    tenantId?: string,
    userId?: string,
    idempotencyKey?: string
  ) {
    return prisma.payment.upsert({
      where: { transactionId },
      update: {
        amount,
        transactionId,
        status: PaymentStatus.PENDING,
      },
      create: {
        bookingId,
        tenantId: tenantId || '',
        userId: userId || '',
        amount,
        paymentMethod,
        transactionId,
        idempotencyKey: idempotencyKey || transactionId,
        status: PaymentStatus.PENDING,
      },
    });
  }

  async findByTransactionId(transactionId: string) {
    return prisma.payment.findFirst({
      where: { transactionId },
    });
  }

  async verifyAndUpdatePayment(
    paymentId: string,
    bookingId: string,
    _userId: string,
    _amount: number,
    _transactionId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
        },
      });

      return updatedPayment;
    });
  }

  async findUserPaymentHistory(userId: string) {
    return prisma.payment.findMany({
      where: {
        booking: { userId },
      },
      include: {
        booking: {
          include: {
            court: {
              include: {
                venue: {
                  select: { id: true, name: true, address: true, city: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const paymentRepository = new PaymentRepository();
