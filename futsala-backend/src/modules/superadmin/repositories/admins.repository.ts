import prisma from '../../../config/prismaClient';
import bcrypt from 'bcryptjs';

export class SuperAdminAdminsRepository {
  async listAdmins(params: { cursor?: string; limit: number; search?: string }) {
    const { cursor, limit, search } = params;

    return prisma.user.findMany({
      where: {
        role: 'TENANT_ADMIN',
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
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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
        role: 'TENANT_ADMIN',
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
      where: { id },
      data: updateData,
      select: { id: true, fullName: true, email: true, phoneNumber: true },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}

export const superAdminAdminsRepository = new SuperAdminAdminsRepository();
