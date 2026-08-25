import { superAdminVenuesRepository } from '../repositories/venues.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { buildCursorPage, CursorPaginationParams } from '../utils/pagination';

export class SuperAdminVenuesService {
  async listVenues(params: CursorPaginationParams & { search?: string; isActive?: boolean }) {
    const venues = await superAdminVenuesRepository.listAll(params);
    return buildCursorPage(venues, params.limit);
  }

  async createVenue(data: {
    name: string;
    description?: string;
    address: string;
    city: string;
    phoneNumber?: string;
    ownerId: string;
    amenities?: string[];
    images?: string[];
  }) {
    if (!data.name || !data.address || !data.city || !data.ownerId) {
      throw new AppError('Missing required fields', 400, ErrorCode.BAD_REQUEST);
    }

    const owner = await superAdminVenuesRepository.findOwnerById(data.ownerId);
    if (!owner) {
      throw new AppError('Invalid owner: User must be a verified venue owner', 400, ErrorCode.BAD_REQUEST);
    }

    return superAdminVenuesRepository.create(data);
  }

  async getVenue(id: string) {
    const venue = await superAdminVenuesRepository.findById(id);
    if (!venue) {
      throw new AppError('Venue not found', 404, ErrorCode.VENUE_NOT_FOUND);
    }
    return venue;
  }

  async updateVenue(
    id: string,
    body: { courts?: { id?: string; name: string; pricePerHour: number }[] } & Record<string, unknown>
  ) {
    const { courts, ...venueData } = body;
    const venue = await superAdminVenuesRepository.update(id, venueData);

    if (courts && Array.isArray(courts)) {
      for (const court of courts) {
        await superAdminVenuesRepository.upsertCourt({
          id: court.id,
          name: court.name,
          pricePerHour: parseFloat(court.pricePerHour.toString()),
          venueId: id,
        });
      }
    }

    return venue;
  }

  async deleteVenue(id: string) {
    return superAdminVenuesRepository.delete(id);
  }

  async getVenueStats(venueId: string) {
    const bookings = await superAdminVenuesRepository.getBookingsForVenue(venueId);
    const totalRevenue = bookings
      .filter((b) => b.payments?.some((p) => p.status === 'PAID'))
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);
    const commission = totalRevenue * 0.02;

    return {
      bookings,
      summary: {
        totalBookings: bookings.length,
        totalRevenue,
        commission,
        netOwnerEarnings: totalRevenue - commission,
      },
    };
  }
}

export const superAdminVenuesService = new SuperAdminVenuesService();
