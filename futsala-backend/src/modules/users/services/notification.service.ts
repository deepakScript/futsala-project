import { notificationRepository } from '../repositories/notification.repository';
import { AppError, ErrorCode } from '../../../utils/customError';

export class NotificationService {
  async getUserNotifications(userId: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const notifications = await notificationRepository.findByUserId(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { notifications, unreadCount };
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    if (!userId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404, ErrorCode.NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new AppError('You can only update your own notifications', 403, ErrorCode.FORBIDDEN);
    }

    return notificationRepository.markAsRead(notificationId);
  }
}

export const notificationService = new NotificationService();
