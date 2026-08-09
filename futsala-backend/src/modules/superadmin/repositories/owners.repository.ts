import prisma from '../../../config/prismaClient';
import bcrypt from 'bcryptjs';

export class SuperAdminOwnersRepository {
  async listAll() {
    return prisma.user.findMany({
      where: { role: 'VENUE_OWNER' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        _count: { select: { venues: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSimple() {
    return prisma.user.findMany({
      where: { role: 'VENUE_OWNER' },
      select: { id: true, fullName: true, email: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, role: 'VENUE_OWNER' },
      include: {
        venues: {
          include: {
            _count: { select: { courts: true } },
            courts: { include: { _count: { select: { bookings: true } } } },
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
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        password: hashedPassword,
        role: 'VENUE_OWNER',
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
    return prisma.venue.count({ where: { ownerId } });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async getVenuesWithBookings(ownerId: string) {
    return prisma.venue.findMany({
      where: { ownerId },
      include: { courts: { include: { bookings: true } } },
    });
  }
}

export const superAdminOwnersRepository = new SuperAdminOwnersRepository();
