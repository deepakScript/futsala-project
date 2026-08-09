import { Response } from "express";
import prisma from "../../../config/prismaClient";
import { Request } from "express";

export const getVenue = async (req: Request, res: Response) => {
  try {
    const venue = await prisma.venue.findFirst({
      where: { ownerId: req.venueOwner!.id },
      include: { courts: true },
    });
    return res.json(venue);
  } catch (error) {
    console.error("Venue fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const patchVenue = async (req: Request, res: Response) => {
  try {
    const { id, name, address, phoneNumber, description, amenities, courts } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Venue ID is required" });
    }

    const updatedVenue = await prisma.venue.update({
      where: { id, ownerId: req.venueOwner!.id },
      data: { name, address, phoneNumber, description, amenities },
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
              venueId: id,
            },
          });
        }
      }
    }

    return res.json(updatedVenue);
  } catch (error) {
    console.error("Venue update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
