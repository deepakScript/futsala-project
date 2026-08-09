import prisma from '../../../config/prismaClient';

export class NotificationRepository {
  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
