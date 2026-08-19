import prisma from '../../../config/prismaClient';

export class AdminTimeSlotsRepository {
  async findVenueWithSlots(ownerId: string) {
    return prisma.venue.findFirst({
      where: { tenant: { users: { some: { id: ownerId } } } },
      include: {
        courts: true,
      },
    });
  }

  async findCourtWithOwner(courtId: string) {
    return prisma.court.findUnique({
      where: { id: courtId },
      include: {
        venue: {
          include: {
            tenant: {
              include: {
                users: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async updateCourtHours(courtId: string, openTime: string, closeTime: string) {
    return prisma.court.update({
      where: { id: courtId },
      data: {
        openTime,
        closeTime,
      },
    });
  }
}

export const adminTimeSlotsRepository = new AdminTimeSlotsRepository();
