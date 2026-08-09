import prisma from '../../../config/prismaClient';
import bcrypt from 'bcryptjs';

export class SuperAdminAuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async comparePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}

export const superAdminAuthRepository = new SuperAdminAuthRepository();
