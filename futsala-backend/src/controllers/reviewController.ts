// Review Controller
import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: string;
  };
}

// Interface for create review request body
interface CreateReviewBody {
  rating: number;
  comment: string;
}

/**
 * Add review for a futsal
 * @route POST /create/:futsalId
 */
export const createReview = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { futsalId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { rating, comment } = req.body as CreateReviewBody;

    // Validate required fields
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: futsalId }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Futsal venue not found'
      });
    }

    // Check if user has a completed booking at this venue
    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId: userId,
        court: {
          venueId: futsalId
        },
        status: 'COMPLETED' as any // Should ideally use BookingStatus.COMPLETED
      }
    });

    if (!hasBooking) {
      return res.status(403).json({
        success: false,
        message: 'You can only review venues where you have completed bookings'
      });
    }

    // Check if user has already reviewed this venue
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId,
        venueId: futsalId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this venue'
      });
    }

    // Create review and update venue rating in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create review
      const review = await tx.review.create({
        data: {
          userId: userId,
          venueId: futsalId,
          rating: rating,
          comment: comment
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // Calculate new average rating
      const allReviews = await tx.review.findMany({
        where: { venueId: futsalId },
        select: { rating: true }
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allReviews.length;

      // Update venue rating and review count
      await tx.venue.update({
        where: { id: futsalId },
        data: {
          rating: parseFloat(avgRating.toFixed(1)),
          totalReviews: allReviews.length
        }
      });

      // Create notification for venue owner
      await tx.notification.create({
        data: {
          userId: venue.ownerId,
          title: 'New Review Received',
          message: `Your venue "${venue.name}" received a ${rating}-star review`,
          type: 'REVIEW',
          isRead: false
        }
      });

      return review;
    });

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all reviews for a futsal
 * @route GET /futsal/:futsalId
 */
export const getVenueReviews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { futsalId } = req.params;
    const { page = '1', limit = '10', sortBy = 'createdAt' } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: futsalId },
      select: {
        id: true,
        name: true,
        rating: true,
        totalReviews: true
      }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Futsal venue not found'
      });
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }

    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where: { venueId: futsalId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      },
      orderBy: orderBy,
      skip: skip,
      take: limitNum
    });

    // Get total count for pagination
    const totalReviews = await prisma.review.count({
      where: { venueId: futsalId }
    });

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { venueId: futsalId },
      _count: {
        rating: true
      }
    });

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating;
    });

    return res.status(200).json({
      success: true,
      venue: {
        id: venue.id,
        name: venue.name,
        averageRating: venue.rating,
        totalReviews: venue.totalReviews
      },
      ratingDistribution: distribution,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalReviews / limitNum),
        totalReviews: totalReviews,
        limit: limitNum
      },
      data: reviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete user's review
 * @route DELETE /delete/:reviewId
 */
export const deleteReview = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get review details
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        venue: true
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review or is admin
    if (review.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // Delete review and update venue rating in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the review
      await tx.review.delete({
        where: { id: reviewId }
      });

      // Recalculate venue rating
      const remainingReviews = await tx.review.findMany({
        where: { venueId: review.venueId },
        select: { rating: true }
      });

      let newRating = 0;
      let totalReviews = remainingReviews.length;

      if (totalReviews > 0) {
        const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
        newRating = parseFloat((totalRating / totalReviews).toFixed(1));
      }

      // Update venue
      await tx.venue.update({
        where: { id: review.venueId },
        data: {
          rating: newRating,
          totalReviews: totalReviews
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};