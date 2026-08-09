import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../config/prismaClient";

export const listAdmins = async (_req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ admins });
  } catch (error) {
    console.error("Fetch Admins Error:", error);
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
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
    const admin = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber: phoneNumber || "",
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ admin });
  } catch (error) {
    console.error("Create Admin Error:", error);
    return res.status(500).json({ error: "Failed to create admin" });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, password } = req.body;

    const updateData: Record<string, string> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const admin = await prisma.user.update({
      where: { id, role: "ADMIN" },
      data: updateData,
      select: { id: true, fullName: true, email: true, phoneNumber: true },
    });

    return res.json({ admin });
  } catch (error) {
    console.error("Update Admin Error:", error);
    return res.status(500).json({ error: "Failed to update admin" });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id, role: "ADMIN" } });
    return res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete Admin Error:", error);
    return res.status(500).json({ error: "Failed to delete admin" });
  }
};
