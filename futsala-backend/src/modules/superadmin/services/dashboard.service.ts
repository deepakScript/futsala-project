import { superAdminDashboardRepository } from '../repositories/dashboard.repository';

export class SuperAdminDashboardService {
  async getStats() {
    const data = await superAdminDashboardRepository.getPlatformStats();

    const topVenues = data.venuesWithCourts
      .map((venue) => {
        const bookingsCount = venue.courts.reduce((acc, court) => acc + (court._count?.bookings || 0), 0);
        const revenue = venue.courts.reduce((acc, court) => {
          return acc + court.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        }, 0);
        return {
          id: venue.id,
          name: venue.name,
          address: venue.address,
          bookingsCount,
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const platformCommission = data.totalRevenue * 0.02;

    const dayLabels: string[] = [];
    const dayValues: number[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayLabels.push(label);
      
      const count = data.recentBookings.filter((b) => {
        const bDate = new Date(b.createdAt);
        return bDate.getDate() === d.getDate() &&
               bDate.getMonth() === d.getMonth() &&
               bDate.getFullYear() === d.getFullYear();
      }).length;
      dayValues.push(count);
    }

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
      topVenues: topVenues.map(({ id, name, address, bookingsCount }) => ({ id, name, address, bookingsCount })),
      charts: {
        bookingTrend: {
          labels: dayLabels,
          values: dayValues,
        },
        revenueDist: {
          labels: topVenues.map((v) => v.name),
          values: topVenues.map((v) => v.revenue),
        },
      },
    };
  }
}

export const superAdminDashboardService = new SuperAdminDashboardService();
