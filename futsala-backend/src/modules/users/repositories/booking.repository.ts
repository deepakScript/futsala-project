import prisma from '../../../config/prismaClient';
import { BookingStatus, Prisma } from '@prisma/client';

export class BookingRepository {
  async findByIdempotencyKey(key: string) {
    return prisma.booking.findUnique({
      where: { idempotencyKey: key },
      include: {
        court: {
          include: { venue: true },
        },
        payment: true,
      },
    });
  }

  async findConflicting(
    courtId: string,
    bookingDate: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ) {
    return prisma.booking.findFirst({
      where: {
        ...(excludeId && { id: { not: excludeId } }),
        courtId,
        bookingDate,
        status: {
          notIn: [BookingStatus.CANCELLED],
        },
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
          },
          {
            AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
          },
        ],
      },
    });
  }

  async create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({
      data,
      include: {
        court: {
          include: {
            venue: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        court: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                phoneNumber: true,
                images: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        court: {
          include: {
            venue: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        payment: true,
      },
    });
  }

  async update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({
      where: { id },
      data,
      include: {
        court: {
          include: {
            venue: true,
          },
        },
      },
    });
  }
}
