import { Response, NextFunction } from 'express';
import NotificationService from '../services/NotificationService.js';
import { AuthRequest } from '../middleware/auth.js';
import { redisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.js';

const NOTIFICATION_CHANNEL_PREFIX = 'notifications:user:';

export class NotificationController {
  private notifService = NotificationService;

  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 50, skip = 0 } = req.query;
      const notifications = await this.notifService.getUserNotifications(
        req.user!._id,
        parseInt(limit as string),
        parseInt(skip as string)
      );
      const unreadCount = await this.notifService.getUnreadCount(req.user!._id);

      res.json({
        success: true,
        data: notifications,
        unreadCount,
        count: notifications.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = await this.notifService.getUnreadCount(req.user!._id);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this.notifService.markAsRead(id as string, req.user!._id);

      if (!notification) {
        res.status(404).json({ success: false, error: 'Notification not found' });
        return;
      }

      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.notifService.markAllAsRead(req.user!._id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  };

  // SSE endpoint — keeps an open connection and pushes notifications
  stream = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!._id;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write('data: {"type":"connected"}\n\n');

    // Subscribe to the user's Redis channel
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    const channel = `${NOTIFICATION_CHANNEL_PREFIX}${userId}`;

    subscriber.subscribe(channel, (err) => {
      if (err) logger.error('SSE subscription error:', err);
    });

    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        res.write(`data: ${message}\n\n`);
      }
    });

    // Keep-alive ping every 30 seconds
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);

    // Cleanup on disconnect
    req.on('close', async () => {
      clearInterval(keepAlive);
      subscriber.unsubscribe(channel);
      await subscriber.quit();
    });
  };
}

export default new NotificationController();
