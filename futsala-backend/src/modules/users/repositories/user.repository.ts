import prisma from '../../../config/prismaClient';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateProfile(id: string, data: { fullName?: string; phoneNumber?: string; email?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteAccount(userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.booking.deleteMany({ where: { userId } });
      await tx.venue.deleteMany({ where: { ownerId: userId } });
      return tx.user.delete({ where: { id: userId } });
    });
  }
}

export const userRepository = new UserRepository();
