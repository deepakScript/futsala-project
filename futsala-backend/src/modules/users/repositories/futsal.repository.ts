/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../config/prismaClient';
import { SearchQueryDto } from '../dtos/futsal.dto';

export class FutsalRepository {
  async findAllActive(limit = 5) {
    return prisma.venue.findMany({
      where: {
        isActive: true,
      },
      include: {
        courts: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            courtType: true,
            surfaceType: true,
            isIndoor: true,
            pricePerHour: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: limit,
    });
  }

  async findById(id: string) {
    return prisma.venue.findUnique({
      where: { id },
      include: {
        courts: {
          where: {
            isActive: true,
          },
          include: {
            timeSlots: {
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  async search(query: SearchQueryDto) {
    const { location, price, city, courtType, minRating } = query;

    const whereClause: any = {
      isActive: true,
    };

    if (location) {
      whereClause.OR = [
        { address: { contains: location, mode: 'insensitive' } },
        { city: { contains: location, mode: 'insensitive' } },
      ];
    }

    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        whereClause.rating = { gte: rating };
      }
    }

    const courtWhere: any = {
      isActive: true,
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
            pricePerHour: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    return price || courtType ? venues.filter((venue) => venue.courts.length > 0) : venues;
  }
}

export const futsalRepository = new FutsalRepository();
