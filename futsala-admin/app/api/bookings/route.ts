import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { BookingStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded || decoded.role !== 'VENUE_OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const ownerId = decoded.id;

    const where: {
      court?: { venue: { ownerId: string } };
      status?: BookingStatus;
      OR?: Array<Record<string, unknown>>;
      bookingDate?: { gte: Date; lte: Date };
    } = {
      court: {
        venue: {
          ownerId: ownerId,
        },
      },
    };

    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam as BookingStatus;
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { court: { name: { contains: search, mode: 'insensitive' } } },
        { otp: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate && endDate) {
      where.bookingDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        court: {
          include: {
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });

    // Stats for the first row of cards
    const totalToday = await prisma.booking.count({
      where: {
        court: { venue: { ownerId } },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const pendingApprovals = await prisma.booking.count({
      where: {
        court: { venue: { ownerId } },
        status: 'PENDING',
      },
    });

    const totalRevenue = await prisma.booking.aggregate({
      where: {
        court: { venue: { ownerId } },
        paymentStatus: 'PAID',
      },
      _sum: {
        totalPrice: true,
      },
    });

    return NextResponse.json({
      bookings,
      stats: {
        totalToday,
        pendingApprovals,
        revenue: totalRevenue._sum.totalPrice || 0,
      },
    });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded || decoded.role !== 'VENUE_OWNER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: {
          include: {
            venue: {
              select: { ownerId: true },
            },
          },
        },
      },
    });

    if (!booking || booking.court.venue.ownerId !== decoded.id) {
      return NextResponse.json({ message: 'Unauthorized or booking not found' }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return NextResponse.json({ message: 'Status updated', booking: updatedBooking });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
