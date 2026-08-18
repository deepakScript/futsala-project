import prisma from '../../../config/prismaClient';
import bcrypt from 'bcryptjs';
import { PasswordResetToken, User } from '@prisma/client';

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

  async createPasswordResetToken(data: { userId: string; token: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({ data });
  }

  async findPasswordResetToken(token: string): Promise<(PasswordResetToken & { user: User }) | null> {
    return prisma.passwordResetToken.findFirst({
      where: { token },
      include: { user: true },
    });
  }

  async deletePasswordResetToken(id: string): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.delete({
      where: { id },
    });
  }
}

export const adminAuthRepository = new AdminAuthRepository();
