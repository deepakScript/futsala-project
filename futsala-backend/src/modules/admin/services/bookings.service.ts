import { adminBookingRepository } from '../repositories/venues.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { BookingStatus } from '@prisma/client';

export class AdminBookingService {
  async getBookings(params: {
    ownerId: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const bookings = await adminBookingRepository.findAllForOwner({
      ownerId: params.ownerId,
      status: params.status as BookingStatus | undefined,
      search: params.search,
      startDate: params.startDate,
      endDate: params.endDate,
    });

    const stats = await adminBookingRepository.countStats(params.ownerId);
    return { bookings, stats };
  }

  async updateBookingStatus(bookingId: string, status: string, ownerId: string) {
    if (!bookingId || !status) {
      throw new AppError('Missing fields', 400, ErrorCode.BAD_REQUEST);
    }

    const booking = await adminBookingRepository.findById(bookingId);
    const isOwner = booking?.court.venue.tenant.users.some((user) => user.id === ownerId);
    if (!booking || !isOwner) {
      throw new AppError('Unauthorized or booking not found', 403, ErrorCode.FORBIDDEN);
    }

    return adminBookingRepository.updateStatus(bookingId, status as BookingStatus);
  }
}

export const adminBookingService = new AdminBookingService();
