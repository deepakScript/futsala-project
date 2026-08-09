import prisma from '../../../config/prismaClient';
import bcrypt from 'bcryptjs';

export class SuperAdminAdminsRepository {
  async listAdmins() {
    return prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        password: hashedPassword,
        role: 'ADMIN',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: { fullName?: string; phoneNumber?: string; password?: string }
  ) {
    const updateData: Record<string, string> = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    return prisma.user.update({
      where: { id, role: 'ADMIN' },
      data: updateData,
      select: { id: true, fullName: true, email: true, phoneNumber: true },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id, role: 'ADMIN' } });
  }
}

export const superAdminAdminsRepository = new SuperAdminAdminsRepository();
