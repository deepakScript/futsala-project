import { adminEarningsRepository } from '../repositories/earnings.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

export class AdminEarningsService {
  async getEarnings(ownerId: string) {
    if (!ownerId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const bookings = await adminEarningsRepository.findAllBookingsForOwner(ownerId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeekDate = new Date(now);
    startOfWeekDate.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidBookings = bookings.filter((b) => b.paymentStatus === 'PAID');

    const totalEarnings = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const dailyEarnings = paidBookings
      .filter((b) => new Date(b.bookingDate) >= startOfToday)
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const weeklyEarnings = paidBookings
      .filter((b) => new Date(b.bookingDate) >= startOfWeekDate)
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const monthlyEarnings = paidBookings
      .filter((b) => new Date(b.bookingDate) >= startOfMonth)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const methodCounts = paidBookings.reduce(
      (acc, b) => {
        const method = b.payment?.paymentMethod || 'Cash';
        acc[method] = (acc[method] || 0) + b.totalPrice;
        return acc;
      },
      {} as Record<string, number>
    );

    const transactions = paidBookings.map((b) => ({
      id: b.id,
      customer: b.user.fullName,
      venue: b.court.venue.name,
      court: b.court.name,
      amount: b.totalPrice,
      method: b.payment?.paymentMethod || 'Cash',
      date: b.bookingDate,
      status: b.paymentStatus,
    }));

    const pendingPayments = bookings
      .filter((b) => b.paymentStatus === 'PENDING')
      .map((b) => ({
        id: b.id,
        customer: b.user.fullName,
        amount: b.totalPrice,
        date: b.bookingDate,
        status: b.status,
      }));

    return {
      summary: { totalEarnings, dailyEarnings, weeklyEarnings, monthlyEarnings },
      paymentMethods: Object.entries(methodCounts).map(([name, value]) => ({ name, value })),
      transactions,
      pendingPayments,
    };
  }
}

export const adminEarningsService = new AdminEarningsService();
