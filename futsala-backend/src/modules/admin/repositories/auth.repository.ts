import prisma from '../../../config/prismaClient';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

export class AdminAuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async comparePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}

export const adminAuthRepository = new AdminAuthRepository();

