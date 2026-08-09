import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminUploadService } from '../services/upload.service';

export const uploadVenueImage = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.venueOwner!.id;
  const venueId = req.body.venueId as string;
  const url = await adminUploadService.uploadVenueImage(req.file, venueId, ownerId);
  res.json({ url, message: 'Upload successful' });
});
