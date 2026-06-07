import { Router } from 'express';
import EventController from '../controllers/EventController.js';
import { authenticate, requireOrganizer } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validation.js';
import { createEventSchema, updateEventSchema } from '../utils/validators.js';

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);


// Protected routes first (to avoid matching /:id)
router.get('/bookmarks', authenticate, EventController.getUserBookmarks);

// Public routes
router.get('/nearby', EventController.getNearbyEvents);
router.get('/trending', EventController.getTrendingEvents);
router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);

// Protected routes
router.use(authenticate);

// Organizer only routes
router.get('/organizer/events', requireOrganizer, EventController.getEventsByOrganizer)

// User routes
router.post('/:id/bookmark', EventController.bookmarkEvent);
router.delete('/:id/bookmark', EventController.unbookmarkEvent);


router.post('/', requireOrganizer, validateRequest(createEventSchema), EventController.createEvent);
router.put('/:id', requireOrganizer, validateRequest(updateEventSchema), EventController.updateEvent);
router.delete('/:id', requireOrganizer, EventController.deleteEvent);

export default router;