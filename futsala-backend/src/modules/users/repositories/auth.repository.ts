import prisma from '../../../config/prismaClient';
import { User, UserRole } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role?: UserRole;
    tenantId?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role || 'CUSTOMER',
        tenantId: data.tenantId,
      },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { password: passwordHash },
    });
  }
}

export const authRepository = new AuthRepository();

