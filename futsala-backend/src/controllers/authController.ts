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
    res.status(500).json({ error: "Registration failed" });
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
      process.env.JWT_ACCESS_SECRET || 'your-default-secret-key',
      { expiresIn: '1d' } // 15 minutes
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
        expiresIn: 9000 // 15 minutes in seconds
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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes expiry
    console.log("Reset token generated for user:", user.email);
    
    // Delete old OTPs for this user (optional but recommended)
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });
    

    // Save new OTP
    await prisma.passwordResetToken.create({
      data: {
        token: hashedOtp,
        userId: user.id,
        expiresAt,
      },
    });

    console.log("OTP saved to database, attempting to send email...");

    // Email OTP
    const html = `
      <p>Your password reset OTP is:</p>
      <h2>${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
    `;

    try {
      // Validate email configuration before sending
      if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
        console.error("❌ Email configuration missing! Check .env file for:");
        console.error("   - MAIL_HOST:", process.env.MAIL_HOST ? "✓" : "✗");
        console.error("   - MAIL_PORT:", process.env.MAIL_PORT ? "✓" : "✗");
        console.error("   - MAIL_USER:", process.env.MAIL_USER ? "✓" : "✗");
        console.error("   - MAIL_PASSWORD:", process.env.MAIL_PASSWORD ? "✓" : "✗");
        res.status(500).json({ message: "Email service not configured. Please contact administrator." });
        return;
      }

      await sendMail({
        to: user.email,
        subject: "Password Reset OTP",
        html,
      });
      console.log("✅ OTP sent successfully to:", user.email);
    } catch (mailError) {
      console.error("❌ Email sending failed:");
      console.error("Error details:", mailError);
      if (mailError instanceof Error) {
        console.error("Error message:", mailError.message);
        console.error("Error stack:", mailError.stack);
      }
      res.status(500).json({ 
        message: "Failed to send OTP to email",
        error: process.env.NODE_ENV === 'development' ? (mailError as Error).message : undefined
      });
      return;
    }

    res.status(200).json({
      message: "OTP sent to email",
    });

  } catch (error) {
    console.error("Forgot Password Error:", (error as Error).message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const otpVerification = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body as { email: string; otp: string };

  try {
    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 2. Hash the OTP received from user
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // 3. Check OTP in database
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: hashedOtp,
      },
    });

    if (!tokenRecord) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // 4. Check if OTP expired
    if (tokenRecord.expiresAt < new Date()) {
      // delete old OTP
      await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    // 5. OTP is valid — delete it to prevent reuse
    await prisma.passwordResetToken.delete({
      where: { id: tokenRecord.id },
    });

    // 6. Successful verification
    res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("OTP Verification Error:", (error as Error).message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const savePassword = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword } = req.body as {
    email: string;
    newPassword: string;
  };

  try {
    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update the password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 4. Delete all old reset tokens for security
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 5. Response
    res.status(200).json({
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Save Password Error:", (error as Error).message);
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