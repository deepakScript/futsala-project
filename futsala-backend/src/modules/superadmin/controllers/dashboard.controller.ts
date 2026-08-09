import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminDashboardService } from '../services/dashboard.service';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await superAdminDashboardService.getStats();
  res.json(stats);
});
