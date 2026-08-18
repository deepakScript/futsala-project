import prisma from '../../../config/prismaClient';
import { PaymentStatus } from '@prisma/client';

export class SuperAdminBookingsRepository {
  async findAll(params: {
    cursor?: string;
    limit: number;
    venueId?: string;
    status?: string;
    date?: string;
    search?: string;
  }) {
    const { cursor, limit, venueId, status, date, search } = params;
    const where: Record<string, unknown> = {};

    if (venueId) where.court = { venueId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { court: { name: { contains: search, mode: 'insensitive' } } },
        { otp: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.bookingDate = { gte: start, lte: end };
    }

    return prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
        court: { include: { venue: { select: { id: true, name: true, address: true } } } },
        payment: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  async findById(id: string) {
    return prisma.booking.findUnique({ where: { id }, include: { payment: true } });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.booking.update({
      where: { id },
      data,
      include: {
        user: true,
        court: { include: { venue: true } },
        payment: true,
      },
    });
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return prisma.payment.update({ where: { id: paymentId }, data: { status } });
  }

  async delete(id: string) {
    return prisma.booking.delete({ where: { id } });
  }
}

export const superAdminBookingsRepository = new SuperAdminBookingsRepository();
