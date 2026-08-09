import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminProfileService } from '../services/auth.service';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminProfileService.getProfile(req.venueOwner!.id);
  res.json(result);
});

export const patchProfile = asyncHandler(async (req: Request, res: Response) => {
  const updated = await adminProfileService.updateProfile(req.venueOwner!.id, req.body);
  res.json(updated);
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await adminProfileService.updatePassword(req.venueOwner!.id, currentPassword, newPassword);
  res.json({ message: 'Password updated successfully' });
});
