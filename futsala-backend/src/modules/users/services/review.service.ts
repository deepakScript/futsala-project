/* eslint-disable @typescript-eslint/no-explicit-any */
import { reviewRepository } from '../repositories/review.repository';
import { futsalRepository } from '../repositories/futsal.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

export class ReviewService {
  async createReview(userId: string, futsalId: string, rating: number, comment?: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400, ErrorCode.BAD_REQUEST);
    }

    const venue = await futsalRepository.findById(futsalId);
    if (!venue) {
      throw new AppError('Futsal venue not found', 404, ErrorCode.VENUE_NOT_FOUND);
    }

    const hasBooking = await reviewRepository.hasCompletedBooking(userId, futsalId);
    if (!hasBooking) {
      throw new AppError('You can only review venues where you have completed bookings', 403, ErrorCode.FORBIDDEN);
    }

    const existingReview = await reviewRepository.findUserVenueReview(userId, futsalId);
    if (existingReview) {
      throw new AppError('You have already reviewed this venue', 400, ErrorCode.CONFLICT);
    }

    return reviewRepository.createReviewAndRecalculateRating(
      userId,
      futsalId,
      rating,
      comment || '',
      venue.ownerId,
      venue.name
    );
  }

  async getVenueReviews(futsalId: string, page = 1, limit = 10, sortBy = 'createdAt') {
    const venue = await futsalRepository.findById(futsalId);
    if (!venue) {
      throw new AppError('Futsal venue not found', 404, ErrorCode.VENUE_NOT_FOUND);
    }

    const skip = (page - 1) * limit;
    const { reviews, totalReviews, ratingDistribution } = await reviewRepository.findVenueReviews(
      futsalId,
      skip,
      limit,
      sortBy
    );

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach((item: any) => {
      distribution[item.rating] = item._count.rating;
    });

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        averageRating: venue.rating,
        totalReviews: venue.totalReviews,
      },
      ratingDistribution: distribution,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        limit,
      },
      reviews,
    };
  }

  async deleteReview(userId: string, userRole: string, reviewId: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError('Review not found', 404, ErrorCode.NOT_FOUND);
    }

    if (review.userId !== userId && userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      throw new AppError('You can only delete your own reviews', 403, ErrorCode.FORBIDDEN);
    }

    return reviewRepository.deleteReviewAndRecalculateRating(reviewId, review.venueId);
  }
}

export const reviewService = new ReviewService();
