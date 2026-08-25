import { Request, Response } from 'express';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import prisma from '../../../config/prismaClient';

export const getReports = async (_req: Request, res: Response) => {
  try {
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
            createdAt: { gte: startDate, lte: endDate },
            role: 'CUSTOMER',
          },
        });

        const newVenues = await prisma.venue.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        });

        return {
          month: format(month, 'MMM'),
          users: newUsers,
          venues: newVenues,
        };
      })
    );

    const revenueData = await Promise.all(
      months.map(async (month) => {
        const startDate = startOfMonth(month);
        const endDate = endOfMonth(month);

        const revenue = await prisma.booking.aggregate({
          where: {
            payments: { some: { status: 'PAID' } },
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { totalPrice: true },
          _count: { id: true },
        });

        return {
          month: format(month, 'MMM'),
          revenue: revenue._sum?.totalPrice ? Number(revenue._sum.totalPrice) : 0,
          bookings: revenue._count?.id || 0,
        };
      })
    );

    const venues = await prisma.venue.findMany({
      include: {
        courts: {
          include: {
            bookings: {
              where: { payments: { some: { status: 'PAID' } } },
              select: { totalPrice: true },
            },
            _count: { select: { bookings: true } },
          },
        },
      },
    });

    const venuePerformance = venues
      .map((venue) => {
        const totalBookings = venue.courts.reduce((acc, court) => acc + (court._count?.bookings || 0), 0);
        const revenue = venue.courts.reduce((acc, court) => {
          return acc + court.bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0);
        }, 0);

        return { name: venue.name, totalBookings, revenue };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalBookings = await prisma.booking.count();
    const cancelledBookings = await prisma.booking.count({
      where: { status: 'CANCELLED' },
    });

    const cancellationRate =
      totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

    const totalUsers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });
    const totalVenues = await prisma.venue.count();
    const totalRevenueResult = await prisma.booking.aggregate({
      where: { payments: { some: { status: 'PAID' } } },
      _sum: { totalPrice: true },
    });
    const totalRevenue = totalRevenueResult._sum?.totalPrice ? Number(totalRevenueResult._sum.totalPrice) : 0;

    return res.json({
      growthData,
      revenueData,
      venuePerformance,
      cancellationRate,
      stats: { totalUsers, totalVenues, totalRevenue, totalBookings },
    });
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return res.status(500).json({ error: 'Failed to fetch reports data' });
  }
};
