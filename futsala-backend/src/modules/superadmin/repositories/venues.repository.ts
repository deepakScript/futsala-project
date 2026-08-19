import prisma from '../../../config/prismaClient';

export class SuperAdminVenuesRepository {
  async listAll(params: {
    cursor?: string;
    limit: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { cursor, limit, search, isActive } = params;

    return prisma.venue.findMany({
      where: {
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { tenant: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        _count: { select: { courts: true, bookings: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  async findById(id: string) {
    return prisma.venue.findUnique({
      where: { id },
      include: {
        tenant: true,
        courts: true,
      },
    });
  }

  async findOwnerById(ownerId: string) {
    return prisma.user.findFirst({ where: { id: ownerId, role: 'TENANT_ADMIN' } });
  }

  async create(data: {
    name: string;
    description?: string;
    address: string;
    city: string;
    phoneNumber?: string;
    ownerId: string;
    amenities?: string[];
    images?: string[];
    tenantId?: string;
  }) {
    let tenantId = data.tenantId;

    if (!tenantId) {
      const owner = await prisma.user.findUnique({
        where: { id: data.ownerId },
        select: { id: true, tenantId: true, fullName: true, email: true },
      });

      if (owner?.tenantId) {
        tenantId = owner.tenantId;
      }
    }

    if (!tenantId) {
      throw new Error('Tenant ID is required to create a venue');
    }

    return prisma.venue.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address,
        city: data.city,
        phoneNumber: data.phoneNumber || '',
        amenities: data.amenities || [],
        images: data.images || [],
        tenantId,
        isActive: true,
      },
    });
  }

  async update(id: string, venueData: Record<string, unknown>) {
    return prisma.venue.update({ where: { id }, data: venueData });
  }

  async upsertCourt(courtData: {
    id?: string;
    name: string;
    pricePerHour: number;
    venueId: string;
  }) {
    if (courtData.id) {
      return prisma.court.update({
        where: { id: courtData.id },
        data: { name: courtData.name, pricePerHour: courtData.pricePerHour },
      });
    }

    return prisma.court.create({
      data: {
        name: courtData.name,
        pricePerHour: courtData.pricePerHour,
        courtType: 'Standard',
        surfaceType: 'Turf',
        venueId: courtData.venueId,
      },
    });
  }

  async delete(id: string) {
    return prisma.venue.delete({ where: { id } });
  }

  async getBookingsForVenue(venueId: string) {
    return prisma.booking.findMany({
      where: { court: { venueId } },
      include: {
        user: { select: { fullName: true, email: true } },
        court: { select: { name: true } },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async getAllWithCourts() {
    return prisma.venue.findMany({
      include: {
        courts: { select: { _count: { select: { bookings: true } } } },
      },
    });
  }
}

export const superAdminVenuesRepository = new SuperAdminVenuesRepository();
