import { Request, Response } from 'express';
import { BookingService, CreateBookingDTO, RescheduleBookingDTO } from '../services/booking.service';
import { AppError } from '../../../utils/AppError';

const bookingService = new BookingService();

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const futsalId = (req.params.futsalId || req.query.futsalId) as string;
    const { date } = req.query as { date?: string };

    const result = await bookingService.checkAvailability(futsalId, date || '');

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { courtId, bookingDate, startTime, endTime, notes } = req.body;
    
    const dto: CreateBookingDTO = {
      userId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      notes
    };

    const booking = await bookingService.createBooking(dto);

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const bookings = await bookingService.getMyBookings(userId);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const booking = await bookingService.getBookingById(userId, id);

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const updatedBooking = await bookingService.cancelBooking(userId, id);

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const rescheduleBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { bookingDate, startTime, endTime } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const dto: RescheduleBookingDTO = {
      userId,
      bookingId: id,
      bookingDate,
      startTime,
      endTime
    };

    const updatedBooking = await bookingService.rescheduleBooking(dto);

    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: updatedBooking
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
