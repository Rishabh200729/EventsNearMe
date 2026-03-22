import { Request, Response, NextFunction } from 'express';
import EventService from '../services/EventService.js';
import { AuthRequest } from '../middleware/auth.js';

export class EventController {
  private eventService = EventService;

  // Create event
  createEvent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
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
      console.log('Fetched events:', events);
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
      const event = await this.eventService.getEventById(id);

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
      const event = await this.eventService.updateEvent(id, req.body, req.user!._id);

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
      await this.eventService.bookmarkEvent(id, req.user!._id);

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
      await this.eventService.unbookmarkEvent(id, req.user!._id);

      res.json({
        success: true,
        message: 'Event unbookmarked successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new EventController();