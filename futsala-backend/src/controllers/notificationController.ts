// Notification Controller
import { Request, Response } from 'express';
import prisma from '../config/prismaClient';


// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: string;
  };
}

/**
 * Get all notifications for user
 * @route GET /
 */
export const getAllNotifications = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: unreadCount,
      data: notifications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Mark a notification as read
 * @route PUT /read/:id
 */
export const markAsRead = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own notifications'
      });
    }

    // Update notification to mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};