import { Response } from "express";
import prisma from "../../../config/prismaClient";
import { Request } from "express";

export const getTimeSlots = async (req: Request, res: Response) => {
  try {
    const venue = await prisma.venue.findFirst({
      where: { ownerId: req.venueOwner!.id },
      include: {
        courts: { include: { timeSlots: true } },
      },
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    return res.json({ courts: venue.courts });
  } catch (error) {
    console.error("Time slots fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTimeSlots = async (req: Request, res: Response) => {
  try {
    const { courtId, daySchedules } = req.body;

    if (!courtId || !daySchedules || !Array.isArray(daySchedules)) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { venue: { select: { ownerId: true } } },
    });

    if (!court || court.venue.ownerId !== req.venueOwner!.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized or court not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.timeSlot.deleteMany({ where: { courtId } });

      const newTimeSlots: {
        courtId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        isAvailable: boolean;
      }[] = [];

      for (const schedule of daySchedules) {
        const { dayOfWeek, openTime, closeTime, blockedSlots } = schedule;
        if (!openTime || !closeTime) continue;

        const openHour = parseInt(openTime.split(":")[0]);
        const closeHour = parseInt(closeTime.split(":")[0]);

        for (let hour = openHour; hour < closeHour; hour++) {
          const startTime = `${hour.toString().padStart(2, "0")}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
          const isBlocked = blockedSlots.includes(startTime);

          newTimeSlots.push({
            courtId,
            startTime,
            endTime,
            dayOfWeek,
            isAvailable: !isBlocked,
          });
        }
      }

      if (newTimeSlots.length > 0) {
        await tx.timeSlot.createMany({ data: newTimeSlots });
      }
    });

    return res.json({ message: "Schedule updated successfully" });
  } catch (error) {
    console.error("Time slots update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
