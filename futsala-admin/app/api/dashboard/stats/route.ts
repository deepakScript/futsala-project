import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
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

    const ownerId = decoded.id;

    // 1. Basic Stats
    const venues = await prisma.venue.findMany({
      where: { ownerId },
      include: {
        courts: {
          include: {
            bookings: {
              where: { paymentStatus: 'PAID' },
            },
          },
        },
      },
    });

    const totalVenues = venues.length;
    const allCourts = venues.flatMap((v) => v.courts);
    const allPaidBookings = allCourts.flatMap((c) => c.bookings);
    
    const totalRevenue = allPaidBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = allPaidBookings.length;
    
    const avgRating = venues.length > 0 
      ? venues.reduce((sum, v) => sum + v.rating, 0) / venues.length 
      : 0;

    // 2. Revenue Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueTrendRaw = await prisma.booking.groupBy({
      by: ['bookingDate'],
      where: {
        court: { venue: { ownerId } },
        paymentStatus: 'PAID',
        bookingDate: { gte: sevenDaysAgo },
      },
      _sum: { totalPrice: true },
      orderBy: { bookingDate: 'asc' },
    });

    const revenueTrend = revenueTrendRaw.map(item => ({
      date: item.bookingDate.toISOString().split('T')[0],
      amount: item._sum.totalPrice || 0,
    }));

    // 3. Court Revenue Distribution
    const courtDistribution = allCourts.map(court => ({
      name: court.name,
      value: court.bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    // 4. Peak Hours Analysis
    const peakHoursRaw = await prisma.booking.groupBy({
      by: ['startTime'],
      where: {
        court: { venue: { ownerId } },
        status: 'CONFIRMED',
      },
      _count: { id: true },
    });

    const peakHours = peakHoursRaw.map(item => ({
      hour: item.startTime,
      count: item._count.id,
    })).sort((a, b) => a.hour.localeCompare(b.hour));

    // 5. Recent Bookings
    const recentBookings = await prisma.booking.findMany({
      where: {
        court: { venue: { ownerId } },
      },
      include: {
        user: { select: { fullName: true, email: true } },
        court: { select: { name: true, venue: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalBookings,
        totalVenues,
        avgRating,
      },
      revenueTrend,
      courtDistribution,
      peakHours,
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        customer: b.user.fullName,
        court: `${b.court.venue.name} - ${b.court.name}`,
        date: b.bookingDate.toISOString().split('T')[0],
        time: `${b.startTime} - ${b.endTime}`,
        amount: b.totalPrice,
        status: b.status,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
