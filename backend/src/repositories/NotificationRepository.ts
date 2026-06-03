import Notification, { INotification } from '../models/Notification.js';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return Notification.create(data);
  }

  async findByUser(userId: string, limit = 50, skip = 0): Promise<INotification[]> {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findUnreadByUser(userId: string): Promise<INotification[]> {
    return Notification.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, read: false });
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  }

  async deleteByEventId(eventId: string): Promise<void> {
    await Notification.deleteMany({ 'data.eventId': eventId });
  }
}

export default new NotificationRepository();
