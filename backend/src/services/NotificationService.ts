import NotificationRepository from '../repositories/NotificationRepository.js';
import { redisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.js';
import { INotification } from '../models/Notification.js';

const NOTIFICATION_CHANNEL_PREFIX = 'notifications:user:';

export class NotificationService {
  private notifRepo = NotificationRepository;

  async createAndPublish(
    userId: string,
    type: INotification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<INotification> {
    const notification = await this.notifRepo.create({ userId, type, title, message, data });

    // Publish to Redis channel for real-time delivery
    try {
      const payload = JSON.stringify(notification.toObject());
      await redisClient.publish(`${NOTIFICATION_CHANNEL_PREFIX}${userId}`, payload);
    } catch (err) {
      logger.error('Redis publish error:', err);
    }

    return notification;
  }

  async getUserNotifications(userId: string, limit = 50, skip = 0): Promise<INotification[]> {
    return this.notifRepo.findByUser(userId, limit, skip);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.countUnread(userId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return this.notifRepo.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.markAllAsRead(userId);
  }
}

export default new NotificationService();
