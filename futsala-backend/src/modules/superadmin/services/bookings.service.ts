import { superAdminBookingsRepository } from '../repositories/bookings.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { buildCursorPage, CursorPaginationParams } from '../utils/pagination';

export class SuperAdminBookingsService {
  async listBookings(params: {
    cursor?: string;
    limit: number;
    venueId?: string;
    status?: string;
    date?: string;
    search?: string;
  }) {
    const bookings = await superAdminBookingsRepository.findAll(params);
    return buildCursorPage(bookings, params.limit);
  }

  async updateBooking(
    id: string,
    data: { status?: string; paymentStatus?: string; notes?: string }
  ) {
    const booking = await superAdminBookingsRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404, ErrorCode.NOT_FOUND);
    }

    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedBooking = await superAdminBookingsRepository.update(id, updateData);

    if (data.paymentStatus && booking.payments && booking.payments.length > 0) {
      for (const payment of booking.payments) {
        await superAdminBookingsRepository.updatePaymentStatus(payment.id, data.paymentStatus as any);
      }
    }

    return updatedBooking;
  }

  async deleteBooking(id: string) {
    return superAdminBookingsRepository.delete(id);
  }
}

export const superAdminBookingsService = new SuperAdminBookingsService();
