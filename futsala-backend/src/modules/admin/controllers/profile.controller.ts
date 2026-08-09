import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../config/prismaClient";
import { Request } from "express";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.venueOwner!.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const venue = await prisma.venue.findFirst({
      where: { ownerId: user.id },
    });

    return res.json({ user, venue });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const patchProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.venueOwner!.id },
      data: { fullName, email, phoneNumber },
      select: { id: true, email: true, fullName: true, phoneNumber: true },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.venueOwner!.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.venueOwner!.id },
      data: { password: hashedNewPassword },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
