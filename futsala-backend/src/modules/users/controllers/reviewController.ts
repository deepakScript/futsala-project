/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { asyncHandler } from '../../../middlewares/asyncHandler';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const futsalId = req.params.futsalId as string;
  const { rating, comment } = req.body;

  const result = await reviewService.createReview(userId, futsalId, rating, comment);

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

export const getVenueReviews = asyncHandler(async (req: Request, res: Response) => {
  const futsalId = req.params.futsalId as string;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  const sortBy = (req.query.sortBy as string) || 'createdAt';

  const result = await reviewService.getVenueReviews(futsalId, page, limit, sortBy);

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const userRole = (req as any).user?.role || '';
  const reviewId = req.params.reviewId as string;

  await reviewService.deleteReview(userId, userRole, reviewId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});
