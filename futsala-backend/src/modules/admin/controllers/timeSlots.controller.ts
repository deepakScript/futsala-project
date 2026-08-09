import { Request, Response } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import { adminTimeSlotsService } from '../services/timeSlots.service';

export const getTimeSlots = asyncHandler(async (req: Request, res: Response) => {
  const courts = await adminTimeSlotsService.getTimeSlots(req.venueOwner!.id);
  res.json({ courts });
});

export const updateTimeSlots = asyncHandler(async (req: Request, res: Response) => {
  const { courtId, daySchedules } = req.body;
  await adminTimeSlotsService.updateTimeSlots(courtId, daySchedules, req.venueOwner!.id);
  res.json({ message: 'Schedule updated successfully' });
});
