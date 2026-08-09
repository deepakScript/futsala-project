import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminBookingService } from '../services/venues.service';

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.venueOwner!.id;
  const { status, search, startDate, endDate } = req.query as Record<string, string | undefined>;

  const result = await adminBookingService.getBookings({ ownerId, status, search, startDate, endDate });
  res.json({ bookings: result.bookings, stats: result.stats });
});

export const patchBooking = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.venueOwner!.id;
  const { bookingId, status } = req.body;

  const updatedBooking = await adminBookingService.updateBookingStatus(bookingId, status, ownerId);
  res.json({ message: 'Status updated', booking: updatedBooking });
});
