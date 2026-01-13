// User Profile Controller
import { Request, Response } from 'express';
import prisma from '../config/prismaClient';

// Note: Request type is already extended globally in verifyToken.ts middleware
// with DecodedUser interface that includes userId, email, etc.

// Interface for update request body
interface UpdateProfileBody {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
}

/**
 * Get logged-in user profile
 * @route GET /me
 */
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        password: false // Exclude password
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update profile information
 * @route PUT /update
 */
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const { fullName, phoneNumber, email } = req.body as UpdateProfileBody;
    
    // Build update object with only provided fields
    const updateData: UpdateProfileBody = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (email !== undefined) updateData.email = email;
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update'
      });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    // Handle unique constraint violation for email
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete user account
 * @route DELETE /delete
 */
export const deleteAccount = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Use transaction to delete user and related data
    await prisma.$transaction(async (tx) => {
      // Delete related records first (due to foreign key constraints)
      await tx.notification.deleteMany({ where: { userId } });
      await tx.review.deleteMany({ where: { userId } });
      await tx.booking.deleteMany({ where: { userId } });
      await tx.venue.deleteMany({ where: { ownerId: userId } });
      
      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });
    
    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    // Handle case where user doesn't exist
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};