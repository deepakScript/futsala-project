import { Response } from "express";
import { BookingStatus } from "@prisma/client";
import prisma from "../../../config/prismaClient";
import { Request } from "express";

export const getBookings = async (req: Request, res: Response) => {
  try {
    const ownerId = req.venueOwner!.id;
    const statusParam = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const where: {
      court?: { venue: { ownerId: string } };
      status?: BookingStatus;
      OR?: Array<Record<string, unknown>>;
      bookingDate?: { gte: Date; lte: Date };
    } = {
      court: { venue: { ownerId } },
    };

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam as BookingStatus;
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { court: { name: { contains: search, mode: "insensitive" } } },
        { otp: { contains: search, mode: "insensitive" } },
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
          select: { fullName: true, email: true, phoneNumber: true },
        },
        court: {
          include: { venue: { select: { name: true } } },
        },
      },
      orderBy: { bookingDate: "desc" },
    });

    const totalToday = await prisma.booking.count({
      where: {
        court: { venue: { ownerId } },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const pendingApprovals = await prisma.booking.count({
      where: { court: { venue: { ownerId } }, status: "PENDING" },
    });

    const totalRevenue = await prisma.booking.aggregate({
      where: { court: { venue: { ownerId } }, paymentStatus: "PAID" },
      _sum: { totalPrice: true },
    });

    return res.json({
      bookings,
      stats: {
        totalToday,
        pendingApprovals,
        revenue: totalRevenue._sum.totalPrice || 0,
      },
    });
  } catch (error) {
    console.error("Bookings API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const patchBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { court: { include: { venue: { select: { ownerId: true } } } } },
    });

    if (!booking || booking.court.venue.ownerId !== req.venueOwner!.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized or booking not found" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return res.json({ message: "Status updated", booking: updatedBooking });
  } catch (error) {
    console.error("Booking update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
