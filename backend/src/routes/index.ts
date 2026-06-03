import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'EventsNearMe API',
    version: '1.0.0',
    description: 'Scalable Event Discovery Platform API',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      bookings: '/api/bookings',
      notifications: '/api/notifications',
    }
  });
});

export default router;