import prisma from '../../../config/prismaClient';

export class AdminTimeSlotsRepository {
  async findVenueWithSlots(ownerId: string) {
    return prisma.venue.findFirst({
      where: { ownerId },
      include: {
        courts: { include: { timeSlots: true } },
      },
    });
  }

  async findCourtWithOwner(courtId: string) {
    return prisma.court.findUnique({
      where: { id: courtId },
      include: { venue: { select: { ownerId: true } } },
    });
  }

  async replaceTimeSlots(
    courtId: string,
    slots: {
      courtId: string;
      startTime: string;
      endTime: string;
      dayOfWeek: number;
      isAvailable: boolean;
    }[]
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.timeSlot.deleteMany({ where: { courtId } });
      if (slots.length > 0) {
        await tx.timeSlot.createMany({ data: slots });
      }
    });
  }
}

export const adminTimeSlotsRepository = new AdminTimeSlotsRepository();
