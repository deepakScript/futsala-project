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

    // 1. Get all bookings for the owner's courts
    const bookings = await prisma.booking.findMany({
      where: {
        court: {
          venue: {
            ownerId: ownerId,
          },
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        court: {
          select: {
            name: true,
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Calculate Stats
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID');

    const totalEarnings = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const dailyEarnings = paidBookings
      .filter(b => new Date(b.bookingDate) >= startOfToday)
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const weeklyEarnings = paidBookings
      .filter(b => new Date(b.bookingDate) >= startOfWeek)
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const monthlyEarnings = paidBookings
      .filter(b => new Date(b.bookingDate) >= startOfMonth)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // 3. Payment Methods Distribution
    const methodCounts = paidBookings.reduce((acc, b) => {
      const method = b.payment?.paymentMethod || 'Cash'; // Default to cash if no payment record
      acc[method] = (acc[method] || 0) + b.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    // 4. Recent Transactions
    const transactions = paidBookings.map(b => ({
      id: b.id,
      customer: b.user.fullName,
      venue: b.court.venue.name,
      court: b.court.name,
      amount: b.totalPrice,
      method: b.payment?.paymentMethod || 'Cash',
      date: b.bookingDate,
      status: b.paymentStatus,
    }));

    // 5. Pending Payments
    const pendingPayments = bookings
      .filter(b => b.paymentStatus === 'PENDING')
      .map(b => ({
        id: b.id,
        customer: b.user.fullName,
        amount: b.totalPrice,
        date: b.bookingDate,
        status: b.status,
      }));

    return NextResponse.json({
      summary: {
        totalEarnings,
        dailyEarnings,
        weeklyEarnings,
        monthlyEarnings,
      },
      paymentMethods: Object.entries(methodCounts).map(([name, value]) => ({ name, value })),
      transactions,
      pendingPayments,
    });
  } catch (error) {
    console.error('Earnings fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
