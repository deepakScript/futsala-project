import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { superAdminPaymentsService } from '../services/payments.service';
import { parseCursorPagination } from '../utils/pagination';

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const paginationParams = parseCursorPagination(req.query as Record<string, unknown>);
  const { status, method } = req.query as Record<string, string | undefined>;
  const result = await superAdminPaymentsService.listPayments({
    ...paginationParams,
    status,
    method,
  });
  res.json({ payments: result.data, pagination: result.pagination });
});

export const getPaymentStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await superAdminPaymentsService.getPaymentStats();
  res.json(stats);
});

export const getPayouts = asyncHandler(async (_req: Request, res: Response) => {
  const payouts = await superAdminPaymentsService.getPayouts();
  res.json({ payouts });
});
