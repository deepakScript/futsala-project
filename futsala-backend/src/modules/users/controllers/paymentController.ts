/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { asyncHandler } from '../../../middlewares/asyncHandler';

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const { bookingId, return_url } = req.body;

  const result = await paymentService.initiatePayment(userId, bookingId, return_url);

  res.status(200).json({
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const { pidx } = req.body;

  const result = await paymentService.verifyPayment(userId, pidx);

  if (!result.verified) {
    res.status(200).json({
      success: false,
      message: result.message,
      data: result.data,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: result.payment,
  });
});

export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const result = await paymentService.getPaymentHistory(userId);

  res.status(200).json({
    success: true,
    count: result.count,
    statistics: result.statistics,
    data: result.payments,
  });
});
