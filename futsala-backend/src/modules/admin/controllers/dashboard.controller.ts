import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminDashboardService } from '../services/dashboard.service';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const stats = await adminDashboardService.getStats(userId);
  res.json(stats);
});
