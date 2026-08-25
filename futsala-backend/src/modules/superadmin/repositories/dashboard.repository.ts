import prisma from '../../../config/prismaClient';

export class SuperAdminDashboardRepository {
  async getPlatformStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalVenues,
      activeVenueOwners,
      totalBookings,
      totalRevenueData,
      todayBookings,
      pendingApprovals,
      venuesWithCourts,
      recentBookings,
    ] = await Promise.all([
      prisma.venue.count(),
      prisma.user.count({ where: { role: 'TENANT_ADMIN' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { payments: { some: { status: 'PAID' } } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.venue.count({ where: { isActive: false } }),
      prisma.venue.findMany({
        include: {
          courts: {
            include: {
              bookings: {
                where: { payments: { some: { status: 'PAID' } } },
                select: { totalPrice: true },
              },
              _count: { select: { bookings: true } },
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    return {
      totalVenues,
      activeVenueOwners,
      totalBookings,
      totalRevenue: totalRevenueData._sum?.totalPrice ? Number(totalRevenueData._sum.totalPrice) : 0,
      todayBookings,
      pendingApprovals,
      venuesWithCourts,
      recentBookings,
    };
  }
}

export const superAdminDashboardRepository = new SuperAdminDashboardRepository();
