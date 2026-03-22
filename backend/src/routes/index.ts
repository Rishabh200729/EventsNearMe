import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import bookingRoutes from './bookingRoutes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'EventsNearMe API',
    version: '1.0.0',
    description: 'Scalable Event Discovery Platform API',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      bookings: '/api/bookings'
    }
  });
});

export default router;