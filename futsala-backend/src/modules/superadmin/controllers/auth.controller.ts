import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../config/prismaClient";
import { signSuperAdminToken, cookieOptions } from "../../../utils/jwt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signSuperAdminToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("auth-token", token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred during login" });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.cookie("auth-token", "", { ...cookieOptions, maxAge: 0 });
  return res.json({ success: true, message: "Logged out successfully" });
};
