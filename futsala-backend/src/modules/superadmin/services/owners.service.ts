import { superAdminOwnersRepository } from '../repositories/owners.repository';
import { AppError, ErrorCode } from '../../../utils/customError';
import { buildCursorPage, CursorPaginationParams } from '../utils/pagination';

export class SuperAdminOwnersService {
  async listOwners(params: CursorPaginationParams & { search?: string }) {
    const owners = await superAdminOwnersRepository.listAll(params);
    return buildCursorPage(owners, params.limit);
  }

  async listOwnersSimple() {
    return superAdminOwnersRepository.listSimple();
  }

  async createOwner(data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) {
    if (!data.fullName || !data.email || !data.password) {
      throw new AppError('Missing required fields', 400, ErrorCode.BAD_REQUEST);
    }

    const existing = await superAdminOwnersRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already in use', 400, ErrorCode.CONFLICT);
    }

    return superAdminOwnersRepository.create(data);
  }

  async getOwner(id: string) {
    const owner = await superAdminOwnersRepository.findById(id);
    if (!owner) {
      throw new AppError('Owner not found', 404, ErrorCode.NOT_FOUND);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeOwner } = owner;
    return safeOwner;
  }

  async updateOwner(id: string, data: Record<string, unknown>) {
    return superAdminOwnersRepository.update(id, data);
  }

  async deleteOwner(id: string) {
    const venueCount = await superAdminOwnersRepository.countVenues(id);
    if (venueCount > 0) {
      throw new AppError(
        'Cannot delete owner with active venues. Delete venues first.',
        400,
        ErrorCode.CONFLICT
      );
    }
    return superAdminOwnersRepository.delete(id);
  }

  async getOwnerPerformance(id: string) {
    const owner = await superAdminOwnersRepository.findById(id);
    if (!owner) {
      throw new AppError('Venue owner not found', 404, ErrorCode.NOT_FOUND);
    }

    const venues = await superAdminOwnersRepository.getVenuesWithBookings(id);

    let totalRevenue = 0;
    let totalBookings = 0;
    const venueBreakdown: {
      id: string;
      name: string;
      revenue: number;
      bookingsCount: number;
      platformCommission: number;
    }[] = [];

    venues.forEach((venue) => {
      let revenue = 0;
      let bookingsCount = 0;
      venue.courts.forEach((court) => {
        court.bookings.forEach((booking) => {
          if (booking.paymentStatus === 'PAID') revenue += booking.totalPrice;
          bookingsCount++;
        });
      });
      totalRevenue += revenue;
      totalBookings += bookingsCount;
      venueBreakdown.push({
        id: venue.id,
        name: venue.name,
        revenue,
        bookingsCount,
        platformCommission: revenue * 0.02,
      });
    });

    return {
      totalRevenue,
      totalBookings,
      platformCommission: totalRevenue * 0.02,
      netOwnerEarnings: totalRevenue * 0.98,
      venueBreakdown,
    };
  }
}

export const superAdminOwnersService = new SuperAdminOwnersService();
