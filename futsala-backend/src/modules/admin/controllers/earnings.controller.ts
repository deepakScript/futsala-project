import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminEarningsService } from '../services/earnings.service';

export const getEarnings = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.venueOwner!.id;
  const result = await adminEarningsService.getEarnings(ownerId);
  res.json(result);
});
