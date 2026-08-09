import { superAdminDashboardRepository } from '../repositories/dashboard.repository';

export class SuperAdminDashboardService {
  async getStats() {
    const data = await superAdminDashboardRepository.getPlatformStats();

    const topVenues = data.venuesWithCourts
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        bookingsCount: venue.courts.reduce((acc, court) => acc + (court._count?.bookings || 0), 0),
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5);

    const platformCommission = data.totalRevenue * 0.02;

    return {
      metrics: {
        totalVenues: data.totalVenues,
        activeVenueOwners: data.activeVenueOwners,
        totalBookings: data.totalBookings,
        totalRevenue: data.totalRevenue,
        todayBookings: data.todayBookings,
        pendingApprovals: data.pendingApprovals,
        platformCommission,
      },
      topVenues,
      charts: {
        bookingTrend: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [12, 19, 3, 5, 2, 3, 9],
        },
        revenueDist: {
          labels: topVenues.map((v) => v.name),
          values: topVenues.map((v) => v.bookingsCount * 100),
        },
      },
    };
  }
}

export const superAdminDashboardService = new SuperAdminDashboardService();
