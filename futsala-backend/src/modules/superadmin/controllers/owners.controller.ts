import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../config/prismaClient";

export const listOwners = async (_req: Request, res: Response) => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: "VENUE_OWNER" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        _count: { select: { venues: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ owners });
  } catch (error) {
    console.error("Fetch Owners Error:", error);
    return res.status(500).json({ error: "Failed to fetch owners" });
  }
};

export const createOwner = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber: phoneNumber || "",
        password: hashedPassword,
        role: "VENUE_OWNER",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ owner });
  } catch (error) {
    console.error("Create Owner Error:", error);
    return res.status(500).json({ error: "Failed to create venue owner" });
  }
};

export const getOwner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const owner = await prisma.user.findFirst({
      where: { id, role: "VENUE_OWNER" },
      include: {
        venues: {
          include: {
            _count: { select: { courts: true } },
            courts: { include: { _count: { select: { bookings: true } } } },
          },
        },
      },
    });

    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    const { password: _, ...ownerData } = owner;
    return res.json({ owner: ownerData });
  } catch (error) {
    console.error("Fetch Owner Detail Error:", error);
    return res.status(500).json({ error: "Failed to fetch owner details" });
  }
};

export const patchOwner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword, ...updateData } = req.body;

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedOwner = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, fullName: true, email: true },
    });

    return res.json({ owner: updatedOwner });
  } catch (error) {
    console.error("Update Owner Error:", error);
    return res.status(500).json({ error: "Failed to update owner" });
  }
};

export const deleteOwner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const venueCount = await prisma.venue.count({ where: { ownerId: id } });

    if (venueCount > 0) {
      return res.status(400).json({
        error: "Cannot delete owner with active venues. Delete venues first.",
      });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete Owner Error:", error);
    return res.status(500).json({ error: "Failed to delete owner" });
  }
};

export const getOwnerPerformance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const owner = await prisma.user.findFirst({
      where: { id, role: "VENUE_OWNER" },
    });

    if (!owner) {
      return res.status(404).json({ error: "Venue owner not found" });
    }

    const venues = await prisma.venue.findMany({
      where: { ownerId: id },
      include: { courts: { include: { bookings: true } } },
    });

    let totalRevenue = 0;
    let totalBookings = 0;
    const venuePerformance: {
      id: string;
      name: string;
      revenue: number;
      bookingsCount: number;
      platformCommission: number;
    }[] = [];

    venues.forEach((venue) => {
      let revenue = 0;
      let bookingsCount = 0;

      venue.courts.forEach((court) => {
        court.bookings.forEach((booking) => {
          if (booking.paymentStatus === "PAID") {
            revenue += booking.totalPrice;
          }
          bookingsCount++;
        });
      });

      totalRevenue += revenue;
      totalBookings += bookingsCount;
      venuePerformance.push({
        id: venue.id,
        name: venue.name,
        revenue,
        bookingsCount,
        platformCommission: revenue * 0.1,
      });
    });

    return res.json({
      performance: {
        totalRevenue,
        totalBookings,
        platformCommission: totalRevenue * 0.1,
        netOwnerEarnings: totalRevenue * 0.9,
        venueBreakdown: venuePerformance,
      },
    });
  } catch (error) {
    console.error("Fetch Owner Performance Error:", error);
    return res.status(500).json({ error: "Failed to fetch performance data" });
  }
};
