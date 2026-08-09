import prisma from '../../../config/prismaClient';

export class SuperAdminUsersRepository {
  async listCustomers() {
    return prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
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
