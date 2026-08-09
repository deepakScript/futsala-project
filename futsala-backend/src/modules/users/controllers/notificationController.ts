/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { asyncHandler } from '../../../middlewares/asyncHandler';

export const getAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const { notifications, unreadCount } = await notificationService.getUserNotifications(userId);

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || (req as any).user?.id;
  const id = req.params.id as string;

  const updatedNotification = await notificationService.markNotificationAsRead(userId, id);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: updatedNotification,
  });
});
