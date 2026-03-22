import { Router } from 'express';
import BookingController from '../controllers/BookingController.js';
import { authenticate, requireOrganizer } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimit.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// User routes
router.get('/', BookingController.getUserBookings);
router.post('/events/:eventId', bookingLimiter, BookingController.createBooking);
router.delete('/:id', BookingController.cancelBooking);

// Organizer routes
router.get('/events/:eventId/stats', requireOrganizer, BookingController.getEventBookings);
router.get('/events/:eventId/bookings', requireOrganizer, BookingController.getEventBookings);

export default router;