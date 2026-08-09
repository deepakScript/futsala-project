import { superAdminUsersRepository } from '../repositories/users.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

export class SuperAdminUsersService {
  async listCustomers() {
    const users = await superAdminUsersRepository.listCustomers();
    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      totalBookings: user._count.bookings,
    }));
  }

  async updateStatus(id: string, isVerified: unknown) {
    if (typeof isVerified !== 'boolean') {
      throw new AppError('Invalid status provided. Expected boolean.', 400, ErrorCode.BAD_REQUEST);
    }
    return superAdminUsersRepository.updateStatus(id, isVerified);
  }

  async getUserBookings(id: string) {
    const bookings = await superAdminUsersRepository.getBookings(id);
    return bookings.map((booking) => ({
      id: booking.id,
      venueName: booking.court.venue.name,
      courtName: booking.court.name,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    }));
  }
}

export const superAdminUsersService = new SuperAdminUsersService();
