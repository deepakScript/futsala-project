import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminBookingsService } from '../services/bookings.service';
import { parseCursorPagination } from '../utils/pagination';

export const listBookings = asyncHandler(async (req: Request, res: Response) => {
  const paginationParams = parseCursorPagination(req.query as Record<string, unknown>);
  const { venueId, status, date, search } = req.query as Record<string, string | undefined>;
  const result = await superAdminBookingsService.listBookings({
    ...paginationParams,
    venueId,
    status,
    date,
    search,
  });
  res.json({ bookings: result.data, pagination: result.pagination });
});

export const patchBooking = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const booking = await superAdminBookingsService.updateBooking(id, req.body);
  res.json({ booking });
});

export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await superAdminBookingsService.deleteBooking(id);
  res.json({ message: 'Booking deleted successfully' });
});
