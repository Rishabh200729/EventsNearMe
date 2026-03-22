import EventRepository from '../repositories/EventRepository.js';
import BookingRepository from '../repositories/BookingRepository.js';
import { redisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.js';
import { IEvent } from '../models/Event.js';

export class EventService {
  private eventRepo = EventRepository;
  private bookingRepo = BookingRepository;

  async createEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    try {
      // Validate business rules
      if (eventData.capacity! <= 0) {
        throw new Error('Event capacity must be greater than 0');
      }

      if (eventData.price! < 0) {
        throw new Error('Event price cannot be negative');
      }

      if (eventData.date! <= new Date()) {
        throw new Error('Event date must be in the future');
      }

      const event = await this.eventRepo.create(eventData);

      // Invalidate caches so new events show up immediately
      await this.invalidateEventCaches();

      logger.info(`Event created: ${event._id} by organizer ${event.organizerId}`);
      return event;
    } catch (error) {
      logger.error('Error in createEvent service:', error);
      throw error;
    }
  }

  async getEventById(id: string, incrementViews = true): Promise<IEvent | null> {
    try {
      const event = await this.eventRepo.findById(id);
      if (!event) return null;

      if (incrementViews) {
        // Increment views asynchronously
        this.eventRepo.incrementViews(id).catch(err =>
          logger.error('Error incrementing views:', err)
        );
      }

      return event;
    } catch (error) {
      logger.error('Error in getEventById service:', error);
      throw error;
    }
  }

  async getNearbyEvents(
    longitude: number,
    latitude: number,
    radius = 5000,
    limit = 50
  ): Promise<IEvent[]> {
    try {
      const cacheKey = `nearby:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${radius}`;

      // Try cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info('Serving nearby events from cache');
        console.log("from cache", cached);
        return JSON.parse(cached);
      }

      const events = await this.eventRepo.findNearby(longitude, latitude, radius, limit);

      // Cache for 5 minutes
      await redisClient.setex(cacheKey, 300, JSON.stringify(events));

      return events;
    } catch (error) {
      logger.error('Error in getNearbyEvents service:', error);
      throw error;
    }
  }

  async getEventsByCategory(category: string, limit = 50): Promise<IEvent[]> {
    try {
      return await this.eventRepo.findByCategory(category, limit);
    } catch (error) {
      logger.error('Error in getEventsByCategory service:', error);
      throw error;
    }
  }

  async getTrendingEvents(limit = 50): Promise<IEvent[]> {
    try {
      const cacheKey = `trending:events`;

      // Try cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info('Serving trending events from cache');
        return JSON.parse(cached);
      }

      const events = await this.eventRepo.getTrending(limit);

      // Cache for 10 minutes
      await redisClient.setex(cacheKey, 600, JSON.stringify(events));

      return events;
    } catch (error) {
      logger.error('Error in getTrendingEvents service:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updateData: Partial<IEvent>, organizerId: string): Promise<IEvent | null> {
    try {
      const event = await this.eventRepo.findById(id);
      if (!event) {
        throw new Error('Event not found');
      }

      if (event.organizerId !== organizerId) {
        throw new Error('Unauthorized to update this event');
      }

      // Validate business rules for updates
      if (updateData.capacity && updateData.capacity < (event.capacity - event.availableSeats)) {
        throw new Error('Cannot reduce capacity below current bookings');
      }

      if (updateData.date && updateData.date <= new Date()) {
        throw new Error('Event date must be in the future');
      }

      const updatedEvent = await this.eventRepo.update(id, updateData);

      // Invalidate caches
      await this.invalidateEventCaches();

      logger.info(`Event updated: ${id}`);
      return updatedEvent;
    } catch (error) {
      logger.error('Error in updateEvent service:', error);
      throw error;
    }
  }

  async deleteEvent(id: string, organizerId: string): Promise<boolean> {
    try {
      const event = await this.eventRepo.findById(id);
      if (!event) {
        throw new Error('Event not found');
      }

      if (event.organizerId !== organizerId) {
        throw new Error('Unauthorized to delete this event');
      }

      // Check if there are confirmed bookings
      const confirmedBookings = await this.bookingRepo.findByEvent(id, 'confirmed');
      if (confirmedBookings.length > 0) {
        throw new Error('Cannot delete event with confirmed bookings');
      }

      const deleted = await this.eventRepo.delete(id);

      if (deleted) {
        // Cancel any reserved bookings
        await this.bookingRepo.cancelExpiredReservations();

        // Invalidate caches
        await this.invalidateEventCaches();

        logger.info(`Event deleted: ${id}`);
      }

      return deleted;
    } catch (error) {
      logger.error('Error in deleteEvent service:', error);
      throw error;
    }
  }

  async bookmarkEvent(eventId: string, userId: string): Promise<void> {
    try {
      // Check if already bookmarked (you'd need a Bookmark model for this)
      // For now, just increment
      await this.eventRepo.incrementBookmarks(eventId);
      logger.info(`Event bookmarked: ${eventId} by user ${userId}`);
    } catch (error) {
      logger.error('Error in bookmarkEvent service:', error);
      throw error;
    }
  }

  async unbookmarkEvent(eventId: string, userId: string): Promise<void> {
    try {
      await this.eventRepo.decrementBookmarks(eventId);
      logger.info(`Event unbookmarked: ${eventId} by user ${userId}`);
    } catch (error) {
      logger.error('Error in unbookmarkEvent service:', error);
      throw error;
    }
  }

  async invalidateEventCaches(): Promise<void> {
    try {
      // Invalidate trending cache
      await redisClient.del('trending:events');
      console.log(await redisClient.keys("*"))
      // Clear all location-specific nearby caches
      const nearbyKeys = await redisClient.keys('nearby:*');
      if (nearbyKeys.length > 0) {
        await redisClient.del(...nearbyKeys);
      }
    } catch (error) {
      logger.error('Error invalidating caches:', error);
    }
  }
}

export default new EventService();