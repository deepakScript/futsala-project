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
        timeSlots: {
          orderBy: {
            startTime: 'asc',
          },
        },
        bookings: {
          // Note: we can filter bookings by date via a service query
        },
      },
    });
  }

  async findActiveCourtsWithAvailability(venueId: string, dayOfWeek: number, startOfDay: Date, endOfDay: Date) {
    return prisma.court.findMany({
      where: {
        venueId,
        isActive: true,
      },
      include: {
        timeSlots: {
          where: {
            dayOfWeek,
            isAvailable: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
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
