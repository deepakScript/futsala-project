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
    return venue.courts;
  }

  async updateTimeSlots(courtId: string, daySchedules: DaySchedule[], ownerId: string) {
    if (!courtId || !daySchedules || !Array.isArray(daySchedules)) {
      throw new AppError('Invalid data provided', 400, ErrorCode.BAD_REQUEST);
    }

    const court = await adminTimeSlotsRepository.findCourtWithOwner(courtId);
    if (!court || court.venue.ownerId !== ownerId) {
      throw new AppError('Unauthorized or court not found', 403, ErrorCode.FORBIDDEN);
    }

    const newTimeSlots: {
      courtId: string;
      startTime: string;
      endTime: string;
      dayOfWeek: number;
      isAvailable: boolean;
    }[] = [];

    for (const schedule of daySchedules) {
      const { dayOfWeek, openTime, closeTime, blockedSlots } = schedule;
      if (!openTime || !closeTime) continue;

      const openHour = parseInt(openTime.split(':')[0]);
      const closeHour = parseInt(closeTime.split(':')[0]);

      for (let hour = openHour; hour < closeHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        newTimeSlots.push({
          courtId,
          startTime,
          endTime,
          dayOfWeek,
          isAvailable: !blockedSlots.includes(startTime),
        });
      }
    }

    await adminTimeSlotsRepository.replaceTimeSlots(courtId, newTimeSlots);
  }
}

export const adminTimeSlotsService = new AdminTimeSlotsService();
