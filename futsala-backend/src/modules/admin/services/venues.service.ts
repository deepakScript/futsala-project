import { adminVenueRepository, adminBookingRepository } from '../repositories/venues.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { BookingStatus } from '@prisma/client';

export class AdminVenueService {
  async getVenue(ownerId: string) {
    return adminVenueRepository.findByOwnerId(ownerId);
  }

  async updateVenue(
    id: string,
    ownerId: string,
    data: {
      name?: string;
      address?: string;
      phoneNumber?: string;
      description?: string;
      amenities?: string[];
      courts?: { id?: string; name: string; pricePerHour: number }[];
    }
  ) {
    if (!id) {
      throw new AppError('Venue ID is required', 400, ErrorCode.BAD_REQUEST);
    }

    const updatedVenue = await adminVenueRepository.update(id, ownerId, {
      name: data.name,
      address: data.address,
      phoneNumber: data.phoneNumber,
      description: data.description,
      amenities: data.amenities,
    });

    if (data.courts && Array.isArray(data.courts)) {
      for (const court of data.courts) {
        await adminVenueRepository.upsertCourt({
          id: court.id,
          name: court.name,
          pricePerHour: parseFloat(court.pricePerHour.toString()),
          venueId: id,
        });
      }
    }

    return updatedVenue;
  }
}

export const adminVenueService = new AdminVenueService();

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
    if (!booking || booking.court.venue.ownerId !== ownerId) {
      throw new AppError('Unauthorized or booking not found', 403, ErrorCode.FORBIDDEN);
    }

    return adminBookingRepository.updateStatus(bookingId, status as BookingStatus);
  }
}

export const adminBookingService = new AdminBookingService();
