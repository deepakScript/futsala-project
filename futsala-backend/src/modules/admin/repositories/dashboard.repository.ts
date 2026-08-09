import prisma from '../../../config/prismaClient';

export class AdminDashboardRepository {
  async getOwnerVenuesWithBookings(ownerId: string) {
    return prisma.venue.findMany({
      where: { ownerId },
      include: {
        courts: {
          include: {
            bookings: { where: { paymentStatus: 'PAID' } },
          },
        },
      },
    });
  }

  async getRevenueTrend(ownerId: string, daysAgo: Date) {
    return prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        court: { venue: { ownerId } },
        paymentStatus: 'PAID',
        bookingDate: { gte: daysAgo },
      },
      _sum: { totalPrice: true },
      orderBy: { bookingDate: 'asc' },
    });
  }

  async getPeakHours(ownerId: string) {
    return prisma.booking.groupBy({
      by: ['startTime'],
      where: { court: { venue: { ownerId } }, status: 'CONFIRMED' },
      _count: { id: true },
    });
  }

  async getRecentBookings(ownerId: string) {
    return prisma.booking.findMany({
      where: { court: { venue: { ownerId } } },
      include: {
        user: { select: { fullName: true, email: true } },
        court: { select: { name: true, venue: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }
}

export const adminDashboardRepository = new AdminDashboardRepository();
