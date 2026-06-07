import { Router } from 'express';
import BookingController from '../controllers/BookingController.js';
import { authenticate, requireOrganizer } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validation.js';
import { createBookingSchema } from '../utils/validators.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// User routes
router.get('/', BookingController.getUserBookings);
router.post('/events/:eventId', bookingLimiter, validateRequest(createBookingSchema), BookingController.createBooking);
router.delete('/:id', BookingController.cancelBooking);
router.get('/:id/checkin-info', requireOrganizer, BookingController.getCheckinInfo);
router.put('/:id/checkin', requireOrganizer, BookingController.checkInUser);

// Waitlist routes
router.post('/events/:eventId/waitlist', BookingController.joinWaitlist);
router.delete('/events/:eventId/waitlist', BookingController.leaveWaitlist);
router.get('/events/:eventId/waitlist', BookingController.getWaitlistStatus);

// Organizer routes
router.get('/events/:eventId/waitlist/all', requireOrganizer, BookingController.getEventWaitlist);
router.get('/events/:eventId/stats', requireOrganizer, BookingController.getEventBookings);
router.get('/events/:eventId/bookings', requireOrganizer, BookingController.getEventBookings);

export default router;