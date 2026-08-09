import { futsalRepository } from '../repositories/futsal.repository';
import { SearchQueryDto } from '../dtos/futsal.dto';
import { AppError, ErrorCode } from '../../../utils/customError';

export class FutsalService {
  async getAllVenues() {
    return futsalRepository.findAllActive();
  }

  async getVenueById(id: string) {
    const venue = await futsalRepository.findById(id);
    if (!venue) {
      throw new AppError('Venue not found', 404, ErrorCode.VENUE_NOT_FOUND);
    }
    if (!venue.isActive) {
      throw new AppError('Venue is not active', 404, ErrorCode.VENUE_NOT_FOUND);
    }
    return venue;
  }

  async searchVenues(query: SearchQueryDto) {
    return futsalRepository.search(query);
  }
}

export const futsalService = new FutsalService();
