import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminVenueService } from '../services/venues.service';

export const getVenue = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.venueOwner!.id;
  const venue = await adminVenueService.getVenue(ownerId);
  res.json(venue);
});

export const patchVenue = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.venueOwner!.id;
  const { id, ...data } = req.body;
  const updatedVenue = await adminVenueService.updateVenue(id, ownerId, data);
  res.json(updatedVenue);
});
