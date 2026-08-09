/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import {
  BookingService,
  CreateBookingDTO,
  RescheduleBookingDTO,
} from '../services/booking.service';
import { asyncHandler } from '../../../middlewares/asyncHandler';

const bookingService = new BookingService();

export const checkAvailability = asyncHandler(async (req: Request, res: Response) => {
  const futsalId = (req.params.futsalId || req.query.futsalId) as string;
  const { date } = req.query as { date?: string };

  const result = await bookingService.checkAvailability(futsalId, date || '');

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const { courtId, bookingDate, startTime, endTime, notes } = req.body;

  const dto: CreateBookingDTO = {
    userId,
    courtId,
    bookingDate,
    startTime,
    endTime,
    notes,
  };

  const booking = await bookingService.createBooking(dto);

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking,
  });
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const bookings = await bookingService.getMyBookings(userId);

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const id = req.params.id as string;

  const booking = await bookingService.getBookingById(userId, id);

  res.status(200).json({
    success: true,
    data: booking,
  });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const id = req.params.id as string;

  const updatedBooking = await bookingService.cancelBooking(userId, id);

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: updatedBooking,
  });
});

export const rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const id = req.params.id as string;
  const { bookingDate, startTime, endTime } = req.body;

  const dto: RescheduleBookingDTO = {
    userId,
    bookingId: id,
    bookingDate,
    startTime,
    endTime,
  };

  const updatedBooking = await bookingService.rescheduleBooking(dto);

  res.status(200).json({
    success: true,
    message: 'Booking rescheduled successfully',
    data: updatedBooking,
  });
});
