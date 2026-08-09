/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { asyncHandler } from '../../../middlewares/asyncHandler';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const user = await userService.getProfile(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const updatedUser = await userService.updateProfile(userId, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  await userService.deleteAccount(userId);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});
