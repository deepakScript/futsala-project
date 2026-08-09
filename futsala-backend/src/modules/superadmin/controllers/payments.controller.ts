import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminPaymentsService } from '../services/payments.service';

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const { status, method } = req.query as Record<string, string | undefined>;
  const payments = await superAdminPaymentsService.listPayments({ status, method });
  res.json({ payments });
});

export const getPaymentStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await superAdminPaymentsService.getPaymentStats();
  res.json(stats);
});

export const getPayouts = asyncHandler(async (_req: Request, res: Response) => {
  const payouts = await superAdminPaymentsService.getPayouts();
  res.json({ payouts });
});
