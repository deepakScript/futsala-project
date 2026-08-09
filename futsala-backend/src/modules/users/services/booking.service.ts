import { BookingRepository } from '../repositories/booking.repository';
import { CourtRepository } from '../repositories/court.repository';
import { AppError } from '../../../utils/AppError';
import { publishBookingEvent } from '../../../utils/kafka/producers/bookingProducer';
import crypto from 'crypto';
import { BookingStatus } from '@prisma/client';

export interface CreateBookingDTO {
  userId: string;
  courtId: string;
  bookingDate: string; // ISO format
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
}

export interface RescheduleBookingDTO {
  userId: string;
  bookingId: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
}

export class BookingService {
  private bookingRepo: BookingRepository;
  private courtRepo: CourtRepository;

  constructor() {
    this.bookingRepo = new BookingRepository();
    this.courtRepo = new CourtRepository();
  }

  async checkAvailability(futsalId: string, dateStr: string) {
    if (!futsalId) throw new AppError('Futsal ID is required', 400);
    if (!dateStr) throw new AppError('Date parameter is required', 400);

    const [year, month, day] = dateStr.split('-').map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(bookingDate.getTime())) {
      throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    const dayOfWeek = bookingDate.getUTCDay(); // 0-6 (Sunday-Saturday)
    const startOfDay = new Date(bookingDate);
    const endOfDay = new Date(bookingDate);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const courts = await this.courtRepo.findActiveCourtsWithAvailability(
      futsalId,
      dayOfWeek,
      startOfDay,
      endOfDay
    );

    const flattenedAvailability: any[] = [];

    courts.forEach((court) => {
      const bookedSlots = court.bookings.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      }));

      court.timeSlots.forEach((slot) => {
        // Check if slot overlaps with any booking
        const isBooked = bookedSlots.some((booked) => {
          return !(slot.endTime <= booked.startTime || slot.startTime >= booked.endTime);
        });

        flattenedAvailability.push({
          courtId: court.id,
          courtName: court.name,
          courtType: court.courtType,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: court.pricePerHour,
          isAvailable: !isBooked,
        });
      });
    });

    return {
      date: dateStr,
      dayOfWeek,
      data: flattenedAvailability,
    };
  }

  async createBooking(dto: CreateBookingDTO) {
    const { userId, courtId, bookingDate, startTime, endTime, notes } = dto;

    if (!courtId || !bookingDate || !startTime || !endTime) {
      throw new AppError('All fields are required: courtId, bookingDate, startTime, endTime', 400);
    }

    const bookingDateObj = new Date(bookingDate);
    if (isNaN(bookingDateObj.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    const court = await this.courtRepo.findById(courtId);
    if (!court || !court.isActive) {
      throw new AppError('Court not found or inactive', 404);
    }

    const totalHours = this.calculateHours(startTime, endTime);
    if (totalHours <= 0) {
      throw new AppError('Invalid time range', 400);
    }

    const totalPrice = totalHours * court.pricePerHour;
    const otp = crypto.randomInt(100000, 999999).toString();

    // Check conflicts
    const conflict = await this.bookingRepo.findConflicting(
      courtId,
      bookingDateObj,
      startTime,
      endTime
    );
    if (conflict) {
      throw new AppError('Time slot is already booked', 409);
    }

    // Create the booking
    const booking = await this.bookingRepo.create({
      user: { connect: { id: userId } },
      court: { connect: { id: courtId } },
      bookingDate: bookingDateObj,
      startTime,
      endTime,
      totalHours,
      totalPrice,
      notes,
      otp,
      status: BookingStatus.PENDING,
    });

    // Publish event to Kafka
    await publishBookingEvent('BOOKING_CREATED', booking);

    return booking;
  }

  async getMyBookings(userId: string) {
    return this.bookingRepo.findByUserId(userId);
  }

  async getBookingById(userId: string, bookingId: string) {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const isOwner = booking.userId === userId || (booking as any).court.venue.ownerId === userId;
    if (!isOwner) {
      throw new AppError('Access denied', 403);
    }

    return booking;
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Booking is already cancelled', 400);
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError('Cannot cancel completed booking', 400);
    }

    const updatedBooking = await this.bookingRepo.update(bookingId, {
      status: BookingStatus.CANCELLED,
    });

    // Publish event to Kafka
    await publishBookingEvent('BOOKING_CANCELLED', updatedBooking);

    return updatedBooking;
  }

  async rescheduleBooking(dto: RescheduleBookingDTO) {
    const { userId, bookingId, bookingDate, startTime, endTime } = dto;

    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.userId !== userId) {
      throw new AppError('You can only reschedule your own bookings', 403);
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new AppError('Cannot reschedule cancelled or completed booking', 400);
    }

    const updateData: any = {};
    let recalculatePrice = false;

    if (bookingDate) {
      updateData.bookingDate = new Date(bookingDate);
    }

    if (startTime) {
      updateData.startTime = startTime;
      recalculatePrice = true;
    }

    if (endTime) {
      updateData.endTime = endTime;
      recalculatePrice = true;
    }

    const newBookingDate = bookingDate ? new Date(bookingDate) : booking.bookingDate;
    const newStartTime = startTime || booking.startTime;
    const newEndTime = endTime || booking.endTime;

    if (recalculatePrice) {
      const totalHours = this.calculateHours(newStartTime, newEndTime);
      if (totalHours <= 0) {
        throw new AppError('Invalid time range', 400);
      }
      updateData.totalHours = totalHours;
      updateData.totalPrice = totalHours * (booking as any).court.pricePerHour;
    }

    const conflict = await this.bookingRepo.findConflicting(
      booking.courtId,
      newBookingDate,
      newStartTime,
      newEndTime,
      bookingId
    );
    if (conflict) {
      throw new AppError('New time slot is already booked', 409);
    }

    const updatedBooking = await this.bookingRepo.update(bookingId, updateData);

    // Publish event to Kafka
    await publishBookingEvent('BOOKING_RESCHEDULED', updatedBooking);

    return updatedBooking;
  }

  private calculateHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em - (sh * 60 + sm)) / 60;
  }
}
