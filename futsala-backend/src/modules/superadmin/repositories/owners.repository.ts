import prisma from '../../../config/prismaClient';
import bcrypt from 'bcryptjs';

export class SuperAdminOwnersRepository {
  async listAll(params: { cursor?: string; limit: number; search?: string }) {
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
        tenant: {
          select: {
            _count: { select: { venues: true } },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  async listSimple() {
    return prisma.user.findMany({
      where: { role: 'TENANT_ADMIN' },
      select: { id: true, fullName: true, email: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, role: 'TENANT_ADMIN' },
      include: {
        tenant: {
          include: {
            venues: {
              include: {
                _count: { select: { courts: true } },
                courts: { include: { _count: { select: { bookings: true } } } },
              },
            },
          },
        },
      },
    });
  }

  async create(data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const slugBase = (data.fullName || 'owner')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'owner';
    const uniqueSlug = `${slugBase}-${Date.now()}`;

    const tenant = await prisma.tenant.create({
      data: {
        name: `${data.fullName}'s Organization`,
        slug: uniqueSlug,
      },
    });

    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        password: hashedPassword,
        role: 'TENANT_ADMIN',
        tenantId: tenant.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    if (data.newPassword) {
      data.password = await bcrypt.hash(data.newPassword as string, 10);
      delete data.newPassword;
    }
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, fullName: true, email: true },
    });
  }

  async countVenues(ownerId: string) {
    return prisma.venue.count({
      where: {
        tenant: {
          users: {
            some: { id: ownerId },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async getVenuesWithBookings(ownerId: string) {
    return prisma.venue.findMany({
      where: {
        tenant: {
          users: {
            some: { id: ownerId },
          },
        },
      },
      include: {
        courts: {
          include: {
            bookings: {
              include: { payments: true },
            },
          },
        },
      },
    });
  }
}

export const superAdminOwnersRepository = new SuperAdminOwnersRepository();
