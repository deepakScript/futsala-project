import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: params.id,
      },
      include: {
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

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      venueName: booking.court.venue.name,
      courtName: booking.court.name,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user bookings' },
      { status: 500 }
    );
  }
}
