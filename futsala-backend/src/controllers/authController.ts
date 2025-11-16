import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import sendMail from "../utils/sendMail";
import { log } from "console";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
}

interface AccessTokenPayload extends TokenPayload {
  type: 'access';
}

export const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, phoneNumber } = req.body;

  try {
   
    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      console.log("exist email");
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Check if phone number already exists
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (existingUserByPhone) {
      console.log("exist phone");
      return res.status(400).json({ error: "Phone number is already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        phoneNumber,
        isVerified: false,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      message: "success", 
      user: userWithoutPassword 
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    res.status(500).json({ error: "Registration feeled" });
    console.log(error);
    
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  //my change in the login  section 

  try {
    // Check if user exists with the provided email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'access'
      } as AccessTokenPayload,
      process.env.JWT_SECRET || 'your-default-secret-key',
      { expiresIn: '15m' } // 15 minutes
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh'
      } as RefreshTokenPayload,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' } // 7 days
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      auth: {
        accessToken,
        expiresIn: 900 // 15 minutes in seconds
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
};


export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    // Store hashed token in DB
    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    const html = <p>Your password reset token is:</p><b>${resetToken}</b>;
    await sendMail({ to: user.email, subject: "Password Reset Token", html });

    res.status(200).json({
      message: "Reset token sent to email",
      // Don't send the token in the response for security
    });
  } catch (error) {
    console.error("Forgot Password Error:", (error as Error).message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token not found" });
    }

    try {
      // Verify refresh token
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      ) as RefreshTokenPayload;

      // Check if it's actually a refresh token
      if (payload.type !== 'refresh') {
        return res.status(401).json({ error: "Invalid token type" });
      }

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        return res.status(401).json({ error: "User no longer exists" });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role,
          type: 'access'
        } as AccessTokenPayload,
        process.env.JWT_SECRET || 'your-default-secret-key',
        { expiresIn: '15m' }
      );

      res.json({
        accessToken,
        expiresIn: 900 // 15 minutes in seconds
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }
      throw error;
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

export const getAllUsers = async (_: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};