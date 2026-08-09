import { Request, Response } from "express";
import prisma from "../../../config/prismaClient";

export const listCustomers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      totalBookings: user._count.bookings,
    }));

    return res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const listOwnersSimple = async (_req: Request, res: Response) => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: "VENUE_OWNER" },
      select: { id: true, fullName: true, email: true },
    });
    return res.json({ owners });
  } catch (error) {
    console.error("Fetch Owners Error:", error);
    return res.status(500).json({ error: "Failed to fetch venue owners" });
  }
};

export const patchUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isVerified = req.body.isVerified ?? req.body.isActive;

    if (typeof isVerified !== "boolean") {
      return res
        .status(400)
        .json({ error: "Invalid status provided. Expected boolean." });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified },
    });

    return res.json(user);
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({ error: "Failed to update user status" });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { userId: id },
      include: {
        court: {
          include: { venue: { select: { name: true } } },
        },
      },
      orderBy: { bookingDate: "desc" },
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

    return res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({ error: "Failed to fetch user bookings" });
  }
};
