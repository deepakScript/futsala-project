import { adminDashboardRepository } from '../repositories/dashboard.repository';

export class AdminDashboardService {
  async getStats(ownerId: string) {
    const venues = await adminDashboardRepository.getOwnerVenuesWithBookings(ownerId);

    const totalVenues = venues.length;
    const allCourts = venues.flatMap((v) => v.courts);
    const allPaidBookings = allCourts.flatMap((c) => c.bookings);

    const totalRevenue = allPaidBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = allPaidBookings.length;
    const avgRating =
      venues.length > 0 ? venues.reduce((sum, v) => sum + ((v as any).rating || 0), 0) / venues.length : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueTrendRaw = await adminDashboardRepository.getRevenueTrend(ownerId, sevenDaysAgo);
    const revenueTrend = revenueTrendRaw.map((item) => ({
      date: item.bookingDate.toISOString().split('T')[0],
      amount: item._sum.totalPrice || 0,
    }));

    const courtDistribution = allCourts
      .map((court) => ({
        name: court.name,
        value: court.bookings.reduce((sum, b) => sum + b.totalPrice, 0),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const peakHoursRaw = await adminDashboardRepository.getPeakHours(ownerId);
    const peakHours = peakHoursRaw
      .map((item) => ({ hour: item.startTime, count: item._count.id }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    const recentBookings = await adminDashboardRepository.getRecentBookings(ownerId);

    return {
      summary: { totalRevenue, totalBookings, totalVenues, avgRating },
      revenueTrend,
      courtDistribution,
      peakHours,
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        customer: b.user.fullName,
        court: `${b.court.venue.name} - ${b.court.name}`,
        date: b.bookingDate.toISOString().split('T')[0],
        time: `${b.startTime} - ${b.endTime}`,
        amount: b.totalPrice,
        status: b.status,
      })),
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
