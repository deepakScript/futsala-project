import prisma from '../../../config/prismaClient';

export class AdminEarningsRepository {
  async findAllBookingsForOwner(ownerId: string) {
    return prisma.booking.findMany({
      where: { court: { venue: { tenant: { users: { some: { id: ownerId } } } } } },
      include: {
        user: { select: { fullName: true, email: true } },
        court: { select: { name: true, venue: { select: { name: true } } } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const adminEarningsRepository = new AdminEarningsRepository();
