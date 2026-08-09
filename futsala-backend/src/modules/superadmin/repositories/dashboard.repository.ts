import prisma from '../../../config/prismaClient';

export class SuperAdminDashboardRepository {
  async getPlatformStats() {
    const [
      totalVenues,
      activeVenueOwners,
      totalBookings,
      totalRevenueData,
      todayBookings,
      pendingApprovals,
      venuesWithCourts,
    ] = await Promise.all([
      prisma.venue.count(),
      prisma.user.count({ where: { role: 'VENUE_OWNER' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.venue.count({ where: { isActive: false } }),
      prisma.venue.findMany({
        include: { courts: { select: { _count: { select: { bookings: true } } } } },
      }),
    ]);

    return {
      totalVenues,
      activeVenueOwners,
      totalBookings,
      totalRevenue: totalRevenueData._sum.totalPrice || 0,
      todayBookings,
      pendingApprovals,
      venuesWithCourts,
    };
  }
}

export const superAdminDashboardRepository = new SuperAdminDashboardRepository();
