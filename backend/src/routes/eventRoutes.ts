import { Router } from 'express';
import EventController from '../controllers/EventController.js';
import { authenticate, requireOrganizer } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);


// Public routes
router.get('/nearby', EventController.getNearbyEvents);
router.get('/trending', EventController.getTrendingEvents);
router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);

// Protected routes
router.use(authenticate);

// Organizer only routes
router.get('/organizer/events',requireOrganizer, EventController.getEventsByOrganizer)
// User routes
router.post('/:id/bookmark', EventController.bookmarkEvent);
router.delete('/:id/bookmark', EventController.unbookmarkEvent);


router.post('/', requireOrganizer, EventController.createEvent);
router.put('/:id', requireOrganizer, EventController.updateEvent);
router.delete('/:id', requireOrganizer, EventController.deleteEvent);

export default router;