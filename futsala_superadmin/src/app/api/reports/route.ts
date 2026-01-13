import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

export async function GET() {
  try {
    // 1. Platform Growth (Last 6 Months)
    const sixMonthsAgo = subMonths(new Date(), 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: new Date(),
    });

    const growthData = await Promise.all(
      months.map(async (month) => {
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);

        const newUsers = await prisma.user.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            role: 'CUSTOMER',
          },
        });

        const newVenues = await prisma.venue.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        return {
          month: format(month, 'MMM'),
          users: newUsers,
          venues: newVenues,
        };
      })
    );

    // 2. Monthly Revenue & Booking Trends (Last 6 Months)
    const revenueData = await Promise.all(
      months.map(async (month) => {
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);

        const revenue = await prisma.booking.aggregate({
          where: {
            paymentStatus: 'PAID',
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            totalPrice: true,
          },
          _count: {
            _all: true
          }
        });

        return {
          month: format(month, 'MMM'),
          revenue: revenue._sum.totalPrice || 0,
          bookings: revenue._count._all || 0,
        };
      })
    );

    // 3. Venue-wise Performance (Top 5 by Revenue)
    const venues = await prisma.venue.findMany({
      include: {
        courts: {
          include: {
            bookings: {
              where: {
                paymentStatus: 'PAID',
              },
              select: {
                totalPrice: true,
              },
            },
            _count: {
              select: { bookings: true },
            },
          },
        },
      },
    });

    const venuePerformance = venues
      .map((venue) => {
        const totalBookings = venue.courts.reduce((acc, court) => acc + court._count.bookings, 0);
        const revenue = venue.courts.reduce((acc, court) => {
          return acc + court.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        }, 0);

        return {
          name: venue.name,
          totalBookings,
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 4. Booking Trends (Last 30 Days) / Cancellation Rates
    const totalBookings = await prisma.booking.count();
    const cancelledBookings = await prisma.booking.count({
      where: {
        status: 'CANCELLED',
      },
    });

    const cancellationRate = totalBookings > 0 
      ? ((cancelledBookings / totalBookings) * 100).toFixed(1) 
      : 0;

    // Summary Stats
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalVenues = await prisma.venue.count();
    const totalRevenueResult = await prisma.booking.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalPrice: true },
    });
    const totalRevenue = totalRevenueResult._sum.totalPrice || 0;

    return NextResponse.json({
      growthData,
      revenueData,
      venuePerformance,
      cancellationRate,
      stats: {
        totalUsers,
        totalVenues,
        totalRevenue,
        totalBookings
      }
    });

  } catch (error) {
    console.error('Error fetching reports data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports data' },
      { status: 500 }
    );
  }
}
