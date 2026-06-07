import EventRepository from '../repositories/EventRepository.js';
import BookingRepository from '../repositories/BookingRepository.js';
import BookmarkRepository from '../repositories/BookmarkRepository.js';
import { redisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.js';
import { IEvent } from '../models/Event.js';
import notificationService from './NotificationService.js';

export class EventService {
  private eventRepo = EventRepository;
  private bookingRepo = BookingRepository;
  private bookmarkRepo = BookmarkRepository;

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

      // Add to Redis completion queue
      const score = new Date(event.date).getTime();
      await redisClient.zadd('events:completion', score, event._id.toString());

      logger.info(`Event created: ${event._id} by organizer ${event.organizerId}`);
      return event;
    } catch (error) {
      logger.error('Error in createEvent service:', error);
      throw error;
    }
  }
  async getEventsByOrganizer(organizerId: string): Promise<IEvent[]> {
    try {
      return await this.eventRepo.findByOrganizer(organizerId);
    } catch (error) {
      logger.error('Error in getEventsByOrganizer service:', error);
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
        return JSON.parse(cached);
      }

      const events = await this.eventRepo.findNearby(longitude, latitude, radius, limit);

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(events), "EX", 300);

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
      if (cached !== null) {
        logger.info('Serving trending events from cache');
        return JSON.parse(cached);
      }

      const events = await this.eventRepo.getTrending(limit);
      // Cache for 10 minutes
      await redisClient.set(cacheKey, JSON.stringify(events), "EX", 600);

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

      // Update Redis completion queue if date changed
      if (updateData.date && updatedEvent) {
        const score = new Date(updatedEvent.date).getTime();
        await redisClient.zadd('events:completion', score, id);
      }

      // Notify users who booked this event
      const bookings = await this.bookingRepo.findByEvent(id);
      for (const booking of bookings) {
        notificationService.createAndPublish(
          booking.userId,
          'event_updated',
          'Event Updated',
          `"${event.title}" has been updated. Check the details!`,
          { eventId: id }
        );
      }

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

      if ((event.organizerId as any)._id?.toString() !== organizerId.toString() && event.organizerId.toString() !== organizerId.toString()) {
        throw new Error('Unauthorized to delete this event');
      }

      // Cancel all bookings for this event and return seats
      const allBookings = await this.bookingRepo.findByEvent(id);
      for (const booking of allBookings) {
        await this.bookingRepo.updateStatus(booking._id.toString(), 'cancelled');
        await this.eventRepo.updateAvailableSeats(id, -booking.quantity);

        notificationService.createAndPublish(
          booking.userId,
          'event_deleted',
          'Event Cancelled',
          `"${event.title}" has been cancelled by the organizer.`,
          { eventId: id }
        );
      }

      const deleted = await this.eventRepo.delete(id);

      if (deleted) {
        await this.invalidateEventCaches();
        await redisClient.zrem('events:completion', id);
        logger.info(`Event deleted: ${id} (cancelled ${allBookings.length} bookings)`);
      }

      return deleted;
    } catch (error) {
      logger.error('Error in deleteEvent service:', error);
      throw error;
    }
  }
  async processEventCompletion(): Promise<number> {
    try {
      const now = Date.now();
      // Get all expired event IDs from Redis sorted set
      const expiredEventIds = await redisClient.zrangebyscore('events:completion', 0, now);
      if (expiredEventIds.length === 0) return 0;

      logger.info(`Found ${expiredEventIds.length} completed events in Redis`);

      for (const eventId of expiredEventIds) {
        const event = await this.eventRepo.findById(eventId);
        if (event && event.status === 'upcoming') {
          // 1. Update status in DB
          await this.eventRepo.updateStatus(eventId, 'completed');

          // 2. Invalidate discovery caches
          await this.invalidateEventCaches();

          // 3. Fetch bookings and notify attendees
          const bookings = await this.bookingRepo.findByEvent(eventId);
          const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

          for (const booking of confirmedBookings) {
            await notificationService.createAndPublish(
              booking.userId,
              'event_completed',
              'Event Completed',
              `Thank you for attending "${event.title}"! We hope you had a great time.`,
              { eventId }
            );
          }

          // 4. Calculate stats and notify organizer
          const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
          const checkedInCount = confirmedBookings.filter(b => b.checkedIn).length;

          await notificationService.createAndPublish(
            event.organizerId,
            'organizer_event_completed',
            'Your Event Has Completed',
            `Congratulations! "${event.title}" is completed. Attendees: ${checkedInCount}/${confirmedBookings.length}, Revenue: $${totalRevenue}.`,
            { eventId }
          );

          logger.info(`Successfully completed event: ${eventId}`);
        }

        // Remove from Redis completion queue
        await redisClient.zrem('events:completion', eventId);
      }

      return expiredEventIds.length;
    } catch (error) {
      logger.error('Error in processEventCompletion service:', error);
      throw error;
    }
  }

  async syncUpcomingEventsToRedis(): Promise<number> {
    try {
      const upcomingEvents = await this.eventRepo.findUpcomingEvents();
      let count = 0;
      for (const event of upcomingEvents) {
        const score = new Date(event.date).getTime();
        await redisClient.zadd('events:completion', score, event._id.toString());
        count++;
      }
      logger.info(`Synced ${count} upcoming events to Redis completion queue`);
      return count;
    } catch (error) {
      logger.error('Error syncing upcoming events to Redis:', error);
      throw error;
    }
  }
  async bookmarkEvent(eventId: string, userId: string): Promise<void> {
    try {
      const exists = await this.bookmarkRepo.exists(eventId, userId);
      if (exists) {
        throw new Error("You have already joined/bookmarked this event");
      }
      await this.bookmarkRepo.create(eventId, userId);
      await this.eventRepo.incrementBookmarks(eventId);
      logger.info(`Event bookmarked: ${eventId} by user ${userId}`);
    } catch (error) {
      logger.error('Error in bookmarkEvent service:', error);
      throw error;
    }
  }

  async getUserBookmarks(userId: string): Promise<any[]> {
    try {
      return await this.bookmarkRepo.findByUser(userId);
    } catch (error) {
      logger.error('Error in getUserBookmarks service:', error);
      throw error;
    }
  }

  async unbookmarkEvent(eventId: string, userId: string): Promise<void> {
    try {
      const deleted = await this.bookmarkRepo.delete(eventId, userId);
      if (deleted) {
        await this.eventRepo.decrementBookmarks(eventId);
        logger.info(`Event unbookmarked: ${eventId} by user ${userId}`);
      }
    } catch (error) {
      logger.error('Error in unbookmarkEvent service:', error);
      throw error;
    }
  }

  async invalidateEventCaches(): Promise<void> {
    try {
      // Invalidate trending cache
      await redisClient.del('trending:events');
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