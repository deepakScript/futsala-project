import prisma from '../../../config/prismaClient';

export class SuperAdminUsersRepository {
  async listCustomers(params: { cursor?: string; limit: number; search?: string }) {
    const { cursor, limit, search } = params;

    return prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { _count: { select: { bookings: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  async updateStatus(id: string, isVerified: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isVerified },
    });
  }

  async getBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        court: { include: { venue: { select: { name: true } } } },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }
}

export const superAdminUsersRepository = new SuperAdminUsersRepository();
