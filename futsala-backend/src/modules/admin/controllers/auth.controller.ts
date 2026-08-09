import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../config/prismaClient";
import { signAdminToken, cookieOptions } from "../../../utils/jwt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid || user.role !== "VENUE_OWNER") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signAdminToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 1000 });
    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.fullName, email: user.email },
    });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.cookie("token", "", { ...cookieOptions, maxAge: 0 });
  return res.json({ message: "Logged out successfully" });
};
