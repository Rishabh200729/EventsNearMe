import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import EventService from '../services/EventService.js';
import BookingRepository from '../repositories/BookingRepository.js';
import { AuthRequest } from '../middleware/auth.js';

export class EventController {
  private eventService = EventService;

  // Create event
  createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventData = {
        ...req.body,
        organizerId: req.user!._id
      };

      const event = await this.eventService.createEvent(eventData);

      res.status(201).json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all events
  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, limit = 50 } = req.query;
      let events;
      if (category) {
        events = await this.eventService.getEventsByCategory(
          category as string,
          parseInt(limit as string)
        );
      } else {
        // For now, return trending events as default
        events = await this.eventService.getTrendingEvents(parseInt(limit as string));
      }
      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      next(error);
    }
  };

  getEventsByOrganizer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const events = await this.eventService.getEventsByOrganizer(req.user.id);
      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      next(error);
    }
  };

  // Get event by ID
  getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventById(id as string);
      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found'
        });
        return;
      }

      const response: any = { success: true, data: event };

      // Optionally check if the current user has booked this event
      let token: string | undefined;
      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      if (!token && req.cookies?.auth_token) {
        token = req.cookies.auth_token;
      }
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
          const booking = await BookingRepository.findUserBookingForEvent(decoded.id, id as string);
          response.hasBooked = !!booking;
        } catch {
          // Token invalid or expired — just skip
        }
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  // Get nearby events
  getNearbyEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lat, lng, radius = 5000, limit = 50 } = req.query;

      if (!lat || !lng) {
        res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
        return;
      }

      const events = await this.eventService.getNearbyEvents(
        parseFloat(lng as string),
        parseFloat(lat as string),
        parseInt(radius as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      next(error);
    }
  };

  // Get trending events
  getTrendingEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = 50 } = req.query;

      const events = await this.eventService.getTrendingEvents(parseInt(limit as string));

      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      next(error);
    }
  };

  // Update event
  updateEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const event = await this.eventService.updateEvent(id as string, req.body, req.user!._id);

      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found'
        });
        return;
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete event
  deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
        return;
      }
      const deleted = await this.eventService.deleteEvent(id, req.user!._id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Event not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Bookmark event
  bookmarkEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.eventService.bookmarkEvent(id as string, req.user!._id);

      res.json({
        success: true,
        message: 'Event bookmarked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Unbookmark event
  unbookmarkEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.eventService.unbookmarkEvent(id as string, req.user!._id);

      res.json({
        success: true,
        message: 'Event unbookmarked successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  // Get user bookmarks
  getUserBookmarks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Lazy import to avoid circular dependencies if any, or just use the imported repository
      // Wait, EventService doesn't have a getBookmarks method yet. I will add it to EventService or just import BookmarkRepository here.
      // Let's just import BookmarkRepository at the top of EventController or call a service method.
      // I'll call this.eventService.getUserBookmarks.
      const bookmarks = await this.eventService.getUserBookmarks(req.user!._id);

      res.json({
        success: true,
        data: bookmarks
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new EventController();