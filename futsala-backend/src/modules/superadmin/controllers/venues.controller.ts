import { Request, Response } from "express";
import prisma from "../../../config/prismaClient";

export const listVenues = async (_req: Request, res: Response) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        _count: { select: { courts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ venues });
  } catch (error) {
    console.error("Fetch Venues Error:", error);
    return res.status(500).json({ error: "Failed to fetch venues" });
  }
};

export const createVenue = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      address,
      city,
      phoneNumber,
      ownerId,
      amenities,
      images,
    } = req.body;

    if (!name || !address || !city || !ownerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const owner = await prisma.user.findFirst({
      where: { id: ownerId, role: "VENUE_OWNER" },
    });

    if (!owner) {
      return res.status(400).json({
        error: "Invalid owner: User must be a verified venue owner",
      });
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        description: description || "",
        address,
        city,
        phoneNumber,
        ownerId,
        amenities: amenities || [],
        images: images || [],
        isActive: true,
      },
    });

    return res.status(201).json({ venue });
  } catch (error) {
    console.error("Create Venue Error:", error);
    return res.status(500).json({ error: "Failed to create venue" });
  }
};

export const getVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        owner: true,
        courts: true,
        reviews: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }

    return res.json({ venue });
  } catch (error) {
    console.error("Fetch Venue Error:", error);
    return res.status(500).json({ error: "Failed to fetch venue details" });
  }
};

export const patchVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courts, ...venueData } = req.body;

    const venue = await prisma.venue.update({
      where: { id },
      data: venueData,
    });

    if (courts && Array.isArray(courts)) {
      for (const court of courts) {
        if (court.id) {
          await prisma.court.update({
            where: { id: court.id },
            data: {
              name: court.name,
              pricePerHour: parseFloat(court.pricePerHour.toString()),
            },
          });
        } else {
          await prisma.court.create({
            data: {
              name: court.name,
              pricePerHour: parseFloat(court.pricePerHour.toString()),
              courtType: "Standard",
              surfaceType: "Turf",
              venueId: id,
            },
          });
        }
      }
    }

    return res.json({ venue });
  } catch (error) {
    console.error("Update Venue Error:", error);
    return res.status(500).json({ error: "Failed to update venue" });
  }
};

export const deleteVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.venue.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete Venue Error:", error);
    return res.status(500).json({ error: "Failed to delete venue" });
  }
};

export const getVenueStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { court: { venueId: id } },
      include: {
        user: { select: { fullName: true, email: true } },
        court: { select: { name: true } },
      },
      orderBy: { bookingDate: "desc" },
    });

    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === "PAID")
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const commission = totalRevenue * 0.1;

    return res.json({
      bookings,
      summary: {
        totalBookings: bookings.length,
        totalRevenue,
        commission,
        netOwnerEarnings: totalRevenue - commission,
      },
    });
  } catch (error) {
    console.error("Fetch Venue Stats Error:", error);
    return res.status(500).json({ error: "Failed to fetch venue statistics" });
  }
};
