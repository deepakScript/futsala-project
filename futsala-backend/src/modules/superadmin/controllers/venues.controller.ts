import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminVenuesService } from '../services/venues.service';

export const listVenues = asyncHandler(async (_req: Request, res: Response) => {
  const venues = await superAdminVenuesService.listVenues();
  res.json({ venues });
});

export const createVenue = asyncHandler(async (req: Request, res: Response) => {
  const venue = await superAdminVenuesService.createVenue(req.body);
  res.status(201).json({ venue });
});

export const getVenue = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const venue = await superAdminVenuesService.getVenue(id);
  res.json({ venue });
});

export const patchVenue = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const venue = await superAdminVenuesService.updateVenue(id, req.body);
  res.json({ venue });
});

export const deleteVenue = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await superAdminVenuesService.deleteVenue(id);
  res.json({ success: true });
});

export const getVenueStats = asyncHandler(async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await superAdminVenuesService.getVenueStats(id);
  res.json(result);
});

