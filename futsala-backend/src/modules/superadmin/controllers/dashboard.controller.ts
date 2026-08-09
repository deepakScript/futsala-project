import { Request, Response } from "express";
import prisma from "../../../config/prismaClient";

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalVenues,
      activeVenueOwners,
      totalBookings,
      totalRevenueData,
      todayBookings,
      pendingApprovals,
      venuesWithCourts,
    ] = await Promise.all([
      prisma.venue.count(),
      prisma.user.count({ where: { role: "VENUE_OWNER" } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.venue.count({ where: { isActive: false } }),
      prisma.venue.findMany({
        include: {
          courts: {
            select: { _count: { select: { bookings: true } } },
          },
        },
      }),
    ]);

    const topVenues = venuesWithCourts
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        bookingsCount: venue.courts.reduce(
          (acc, court) => acc + (court._count?.bookings || 0),
          0
        ),
      }))
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5);

    const totalRevenue = totalRevenueData._sum.totalPrice || 0;
    const platformCommission = totalRevenue * 0.02;

    return res.json({
      metrics: {
        totalVenues,
        activeVenueOwners,
        totalBookings,
        totalRevenue,
        todayBookings,
        pendingApprovals,
        platformCommission,
      },
      topVenues,
      charts: {
        bookingTrend: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [12, 19, 3, 5, 2, 3, 9],
        },
        revenueDist: {
          labels: topVenues.map((v) => v.name),
          values: topVenues.map((v) => v.bookingsCount * 100),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Stats API Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch dashboard statistics" });
  }
};
