import prisma from '../../../config/prismaClient';

export class SuperAdminVenuesRepository {
  async listAll() {
    return prisma.venue.findMany({
      include: {
        owner: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
        _count: { select: { courts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.venue.findUnique({
      where: { id },
      include: {
        owner: true,
        courts: true,
        reviews: { include: { user: { select: { fullName: true, email: true } } } },
      },
    });
  }

  async findOwnerById(ownerId: string) {
    return prisma.user.findFirst({ where: { id: ownerId, role: 'VENUE_OWNER' } });
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
  }) {
    return prisma.venue.create({
      data: {
        name: data.name,
        description: data.description || '',
        address: data.address,
        city: data.city,
        phoneNumber: data.phoneNumber || '',
        ownerId: data.ownerId,
        amenities: data.amenities || [],
        images: data.images || [],
        tenantId: '',
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
        tenantId: '',
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
