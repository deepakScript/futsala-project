/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../config/prismaClient';

export class ReviewRepository {
  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: { venue: true },
    });
  }

  async findUserVenueReview(userId: string, venueId: string) {
    return prisma.review.findFirst({
      where: { userId, venueId },
    });
  }

  async hasCompletedBooking(userId: string, venueId: string) {
    return prisma.booking.findFirst({
      where: {
        userId,
        court: { venueId },
        status: 'COMPLETED',
      },
    });
  }

  async createReviewAndRecalculateRating(
    userId: string,
    venueId: string,
    rating: number,
    comment: string,
    venueOwnerId: string,
    venueName: string
  ) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          venueId,
          rating,
          comment: comment || '',
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      const allReviews = await tx.review.findMany({
        where: { venueId },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allReviews.length;

      await tx.venue.update({
        where: { id: venueId },
        data: {
          rating: parseFloat(avgRating.toFixed(1)),
          totalReviews: allReviews.length,
        },
      });

      await tx.notification.create({
        data: {
          userId: venueOwnerId,
          title: 'New Review Received',
          message: `Your venue "${venueName}" received a ${rating}-star review`,
          type: 'REVIEW',
          isRead: false,
        },
      });

      return review;
    });
  }

  async findVenueReviews(venueId: string, skip: number, limit: number, sortBy: string) {
    const orderBy =
      sortBy === 'rating' ? { rating: 'desc' as const } : { createdAt: 'desc' as const };

    const reviews = await prisma.review.findMany({
      where: { venueId },
      include: {
        user: { select: { id: true, fullName: true } },
      },
      orderBy,
      skip,
      take: limit,
    });

    const totalReviews = await prisma.review.count({ where: { venueId } });

    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { venueId },
      _count: { rating: true },
    });

    return { reviews, totalReviews, ratingDistribution };
  }

  async deleteReviewAndRecalculateRating(reviewId: string, venueId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });

      const remainingReviews = await tx.review.findMany({
        where: { venueId },
        select: { rating: true },
      });

      const totalCount = remainingReviews.length;
      let newRating = 0;
      if (totalCount > 0) {
        const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
        newRating = parseFloat((totalRating / totalCount).toFixed(1));
      }

      await tx.venue.update({
        where: { id: venueId },
        data: {
          rating: newRating,
          totalReviews: totalCount,
        },
      });
    });
  }
}

export const reviewRepository = new ReviewRepository();
