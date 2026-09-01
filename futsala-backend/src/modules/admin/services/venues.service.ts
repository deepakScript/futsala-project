import { adminVenueRepository } from '../repositories/venues.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

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
          tenantId: updatedVenue.tenantId,
        });
      }
    }

    return updatedVenue;
  }
}

export const adminVenueService = new AdminVenueService();

