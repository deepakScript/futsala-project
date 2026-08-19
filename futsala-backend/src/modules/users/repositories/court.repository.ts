import prisma from '../../../config/prismaClient';

export class CourtRepository {
  async findById(id: string) {
    return prisma.court.findUnique({
      where: { id },
      include: { venue: true },
    });
  }

  async findActiveCourtsByVenueId(venueId: string) {
    return prisma.court.findMany({
      where: {
        venueId: venueId,
        isActive: true,
      },
      include: {
        bookings: true,
      },
    });
  }

  async findActiveCourtsWithAvailability(
    venueId: string,
    dayOfWeek: number,
    startOfDay: Date,
    endOfDay: Date
  ) {
    return prisma.court.findMany({
      where: {
        venueId,
        isActive: true,
      },
      include: {
        bookings: {
          where: {
            bookingDate: {
              gte: startOfDay,
              lt: endOfDay,
            },
            status: {
              notIn: ['CANCELLED'],
            },
          },
        },
      },
    });
  }
}
