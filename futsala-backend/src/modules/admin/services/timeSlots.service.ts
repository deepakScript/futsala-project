import { adminTimeSlotsRepository } from '../repositories/timeSlots.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

interface DaySchedule {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  blockedSlots: string[];
}

export class AdminTimeSlotsService {
  async getTimeSlots(ownerId: string) {
    const venue = await adminTimeSlotsRepository.findVenueWithSlots(ownerId);
    if (!venue) {
      throw new AppError('Venue not found', 404, ErrorCode.VENUE_NOT_FOUND);
    }
    return venue.courts.map((court) => ({
      ...court,
      timeSlots: [],
    }));
  }

  async updateTimeSlots(courtId: string, daySchedules: DaySchedule[], ownerId: string) {
    if (!courtId || !daySchedules || !Array.isArray(daySchedules)) {
      throw new AppError('Invalid data provided', 400, ErrorCode.BAD_REQUEST);
    }

    const court = await adminTimeSlotsRepository.findCourtWithOwner(courtId);
    const isOwner = court?.venue.tenant.users.some((user) => user.id === ownerId);
    if (!court || !isOwner) {
      throw new AppError('Unauthorized or court not found', 403, ErrorCode.FORBIDDEN);
    }

    const validSchedule = daySchedules.find((s) => s.openTime && s.closeTime);
    if (validSchedule) {
      await adminTimeSlotsRepository.updateCourtHours(
        courtId,
        validSchedule.openTime,
        validSchedule.closeTime
      );
    }
  }
}

export const adminTimeSlotsService = new AdminTimeSlotsService();
