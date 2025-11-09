import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

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
  const { fullName, email, password, phoneNumber, role } = req.body;

  try {
    // Validate role if provided
    const validRoles = ['CUSTOMER', 'VENUE_OWNER', 'ADMIN'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided" });
    }

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Check if phone number already exists
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (existingUserByPhone) {
      return res.status(400).json({ error: "Phone number is already registered" });
    }

    //perform the hashing of the password
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        phoneNumber,
        role: (role as 'CUSTOMER' | 'VENUE_OWNER' | 'ADMIN') || 'CUSTOMER',
        isVerified: false,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      message: "User registered successfully", 
      user: userWithoutPassword 
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    res.status(500).json({ error: "Registration feeled" });
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
