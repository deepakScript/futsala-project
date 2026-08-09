import { Request, Response } from "express";
import prisma from "../../../config/prismaClient";

export const listBookings = async (req: Request, res: Response) => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;
    const search = req.query.search as string | undefined;

    const where: Record<string, unknown> = {};

    if (venueId) {
      where.court = { venueId };
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { court: { name: { contains: search, mode: "insensitive" } } },
        { otp: { contains: search, mode: "insensitive" } },
      ];
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.bookingDate = { gte: startOfDay, lte: endOfDay };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        court: {
          include: {
            venue: { select: { id: true, name: true, address: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ bookings });
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const patchBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        court: { include: { venue: true } },
        payment: true,
      },
    });

    if (paymentStatus === "REFUNDED" && booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: "REFUNDED" },
      });
    }

    return res.json({ booking: updatedBooking });
  } catch (error) {
    console.error("Update Booking Error:", error);
    return res.status(500).json({ error: "Failed to update booking" });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.booking.delete({ where: { id } });
    return res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    return res.status(500).json({ error: "Failed to delete booking" });
  }
};
