import prisma from '../../../config/prismaClient';

export class AdminCustomerRepository {
  async findCustomersForOwner(params: {
    ownerId: string;
    search?: string;
    cursor?: string;
    limit?: number;
  }) {
    const { ownerId, search, cursor, limit = 10 } = params;

    // Find all bookings under venues owned by this owner
    const bookings = await prisma.booking.findMany({
      where: {
        court: {
          venue: {
            tenant: { users: { some: { id: ownerId } } },
          },
        },
        ...(search
          ? {
              OR: [
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { phoneNumber: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });

    // Aggregate statistics per customer
    const customerMap = new Map<
      string,
      {
        id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        totalBookings: number;
        totalSpent: number;
        lastBookingDate?: string;
      }
    >();

    for (const b of bookings) {
      if (!b.user) continue;
      const key = b.user.id;
      const existing = customerMap.get(key) || {
        id: b.user.id,
        fullName: b.user.fullName,
        email: b.user.email,
        phoneNumber: b.user.phoneNumber,
        totalBookings: 0,
        totalSpent: 0,
        lastBookingDate: b.bookingDate ? b.bookingDate.toISOString() : undefined,
      };

      existing.totalBookings += 1;
      existing.totalSpent += Number(b.totalPrice || 0);
      if (b.bookingDate && (!existing.lastBookingDate || new Date(b.bookingDate) > new Date(existing.lastBookingDate))) {
        existing.lastBookingDate = b.bookingDate.toISOString();
      }

      customerMap.set(key, existing);
    }

    const allCustomers = Array.from(customerMap.values());

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = allCustomers.findIndex((c) => c.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedCustomers = allCustomers.slice(startIndex, startIndex + limit);
    const hasNextPage = startIndex + limit < allCustomers.length;
    const nextCursor = hasNextPage && paginatedCustomers.length > 0 ? paginatedCustomers[paginatedCustomers.length - 1].id : null;

    return {
      customers: paginatedCustomers,
      pagination: {
        nextCursor,
        hasNextPage,
        limit,
      },
    };
  }
}

export const adminCustomerRepository = new AdminCustomerRepository();
