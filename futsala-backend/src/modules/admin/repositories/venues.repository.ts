import prisma from '../../../config/prismaClient';
import { BookingStatus } from '@prisma/client';

export class AdminVenueRepository {
  async findByOwnerId(ownerId: string) {
    return prisma.venue.findFirst({
      where: { ownerId },
      include: { courts: true },
    });
  }

  async update(
    id: string,
    ownerId: string,
    data: {
      name?: string;
      address?: string;
      phoneNumber?: string;
      description?: string;
      amenities?: string[];
    }
  ) {
    return prisma.venue.update({
      where: { id, ownerId },
      data,
    });
  }

  async upsertCourt(courtData: {
    id?: string;
    name: string;
    pricePerHour: number;
    venueId: string;
    tenantId?: string;
  }) {
    if (courtData.id) {
      return prisma.court.update({
        where: { id: courtData.id },
        data: {
          name: courtData.name,
          pricePerHour: courtData.pricePerHour,
        },
      });
    }
    return prisma.court.create({
      data: {
        name: courtData.name,
        pricePerHour: courtData.pricePerHour,
        venueId: courtData.venueId,
        tenantId: courtData.tenantId || '',
      },
    });
  }

  async pushImage(id: string, ownerId: string, imageUrl: string) {
    return prisma.venue.update({
      where: { id, ownerId },
      data: { images: { push: imageUrl } },
    });
  }
}

export const adminVenueRepository = new AdminVenueRepository();

export class AdminBookingRepository {
  async findAllForOwner(params: {
    ownerId: string;
    status?: BookingStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { ownerId, status, search, startDate, endDate } = params;

    const where: Record<string, unknown> = {
      court: { venue: { ownerId } },
    };

    if (status && status !== ('ALL' as BookingStatus)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { court: { name: { contains: search, mode: 'insensitive' } } },
        { otp: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate && endDate) {
      where.bookingDate = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    return prisma.booking.findMany({
      where: where as Parameters<typeof prisma.booking.findMany>[0]['where'],
      include: {
        user: { select: { fullName: true, email: true, phoneNumber: true } },
        court: { include: { venue: { select: { name: true } } } },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async countStats(ownerId: string) {
    const totalToday = await prisma.booking.count({
      where: {
        court: { venue: { ownerId } },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    const pendingApprovals = await prisma.booking.count({
      where: { court: { venue: { ownerId } }, status: 'PENDING' },
    });
    const totalRevenueAgg = await prisma.booking.aggregate({
      where: { court: { venue: { ownerId } }, paymentStatus: 'PAID' },
      _sum: { totalPrice: true },
    });
    return {
      totalToday,
      pendingApprovals,
      revenue: totalRevenueAgg._sum.totalPrice || 0,
    };
  }

  async findById(bookingId: string) {
    return prisma.booking.findUnique({
      where: { id: bookingId },
      include: { court: { include: { venue: { select: { ownerId: true } } } } },
    });
  }

  async updateStatus(bookingId: string, status: BookingStatus) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }
}

export const adminBookingRepository = new AdminBookingRepository();
