import { Request, Response } from 'express';
import { futsalService } from '../services/futsal.service';
import { asyncHandler } from '../../../middlewares/asyncHandler';

export const getAllVenues = asyncHandler(async (_req: Request, res: Response) => {
  const venues = await futsalService.getAllVenues();

  res.status(200).json({
    success: true,
    count: venues.length,
    data: venues,
  });
});

export const getVenueById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const venue = await futsalService.getVenueById(id);

  res.status(200).json({
    success: true,
    data: venue,
  });
});

export const searchVenues = asyncHandler(async (req: Request, res: Response) => {
  const venues = await futsalService.searchVenues(req.query);

  res.status(200).json({
    success: true,
    count: venues.length,
    filters: req.query,
    data: venues,
  });
});
