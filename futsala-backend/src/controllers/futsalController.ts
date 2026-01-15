// Futsal Grounds Controller
import { Request, Response } from 'express';
import prisma from '../config/prismaClient';

// Interface for search query parameters
interface SearchQuery {
  location?: string;
  price?: string;
  city?: string;
  courtType?: string;
  minRating?: string;
}

/**
 * Get all futsal grounds
 * @route GET /
 */
export const getAllVenues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const venues = await prisma.venue.findMany({
      where: {
        isActive: true
      },
      include: {
        courts: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            courtType: true,
            surfaceType: true,
            isIndoor: true,
            pricePerHour: true
          }
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      count: venues.length,
      data: venues
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch venues',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get single futsal ground details
 * @route GET /:id
 */
export const getVenueById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        courts: {
          where: {
            isActive: true
          },
          include: {
            timeSlots: {
              orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
              ]
            }
          }
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 2 // Get latest 10 reviews
        }
      }
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    if (!venue.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Venue is not active'
      });
    }

    return res.status(200).json({
      success: true,
      data: venue
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch venue details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search futsal grounds by filters
 * @route GET /search?location=&price=&city=&courtType=&minRating=
 */
export const searchVenues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { location, price, city, courtType, minRating } = req.query as SearchQuery;

    // Build dynamic where clause
    const whereClause: any = {
      isActive: true
    };

    // Filter by location (search in address or city)
    if (location) {
      whereClause.OR = [
        { address: { contains: location, mode: 'insensitive' } },
        { city: { contains: location, mode: 'insensitive' } }
      ];
    }

    // Filter by city
    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }

    // Filter by minimum rating
    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        whereClause.rating = { gte: rating };
      }
    }

    // Build court filter for price and court type
    const courtWhere: any = {
      isActive: true
    };

    if (price) {
      const maxPrice = parseFloat(price);
      if (!isNaN(maxPrice)) {
        courtWhere.pricePerHour = { lte: maxPrice };
      }
    }

    if (courtType) {
      courtWhere.courtType = { contains: courtType, mode: 'insensitive' };
    }

    const venues = await prisma.venue.findMany({
      where: whereClause,
      include: {
        courts: {
          where: courtWhere,
          select: {
            id: true,
            name: true,
            courtType: true,
            surfaceType: true,
            isIndoor: true,
            pricePerHour: true
          }
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    // Filter out venues with no matching courts (if court filters were applied)
    const filteredVenues = (price || courtType) 
      ? venues.filter(venue => venue.courts.length > 0)
      : venues;

    return res.status(200).json({
      success: true,
      count: filteredVenues.length,
      filters: {
        location,
        price,
        city,
        courtType,
        minRating
      },
      data: filteredVenues
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to search venues',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};