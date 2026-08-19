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
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  async search(query: SearchQueryDto) {
    const { location, price, city, courtType } = query;

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
        tenant: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return price || courtType ? venues.filter((venue) => venue.courts.length > 0) : venues;
  }
}

export const futsalRepository = new FutsalRepository();
