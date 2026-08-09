import { superAdminBookingsRepository } from '../repositories/bookings.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

export class SuperAdminBookingsService {
  async listBookings(params: {
    venueId?: string;
    status?: string;
    date?: string;
    search?: string;
  }) {
    return superAdminBookingsRepository.findAll(params);
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

    if (data.paymentStatus === 'REFUNDED' && booking.payment) {
      await superAdminBookingsRepository.updatePaymentStatus(booking.payment.id, 'REFUNDED');
    }

    return updatedBooking;
  }

  async deleteBooking(id: string) {
    return superAdminBookingsRepository.delete(id);
  }
}

export const superAdminBookingsService = new SuperAdminBookingsService();
