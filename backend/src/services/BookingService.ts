import BookingRepository from '../repositories/BookingRepository.js';
import EventRepository from '../repositories/EventRepository.js';
import { redisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.js';
import { IBooking } from '../models/Booking.js';

export class BookingService {
  private bookingRepo = BookingRepository;
  private eventRepo = EventRepository;

  async createBooking(
    eventId: string,
    userId: string,
    quantity = 1
  ): Promise<IBooking> {
    const lockKey = `booking_lock:${eventId}`;
    const availableKey = `event_available:${eventId}`;

    // Acquire distributed lock (10 second timeout)
    const lockAcquired = await redisClient.set(lockKey, 'locked', {
      EX: 10,
      NX: true
    } as any);

    if (!lockAcquired) {
      throw new Error('System busy, please try again');
    }

    try {
      // Get event details
      const event = await this.eventRepo.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      if (event.date <= new Date()) {
        throw new Error('Event has already started');
      }

      // Check if user already has a booking
      const existingBooking = await this.bookingRepo.findUserBookingForEvent(userId, eventId);
      if (existingBooking) {
        throw new Error('You already have a booking for this event');
      }

      // Get current available seats from Redis cache
      let availableSeats = parseInt(await redisClient.get(availableKey) || '0');

      // If not in cache, get from database and cache it
      if (availableSeats === 0) {
        availableSeats = event.availableSeats;
        await redisClient.set(availableKey, availableSeats.toString());
      }

      if (availableSeats < quantity) {
        throw new Error('Not enough seats available');
      }

      // Calculate total amount
      const totalAmount = event.price * quantity;

      // Create booking
      const booking = await this.bookingRepo.create({
        eventId,
        userId,
        quantity,
        totalAmount,
        status: 'confirmed' // Immediate confirmation for simplicity
      });

      // Update available seats in database and cache
      await this.eventRepo.updateAvailableSeats(eventId, quantity);
      await redisClient.decrby(availableKey, quantity);

      // Increment recent bookings for trending
      await this.eventRepo.incrementRecentBookings(eventId);

      logger.info(`Booking created: ${booking._id} for event ${eventId} by user ${userId}`);

      // TODO: Send confirmation notification
      // await this.notificationService.sendBookingConfirmation(booking);

      return booking;
    } finally {
      // Always release the lock
      await redisClient.del(lockKey);
    }
  }

  async getUserBookings(userId: string, status?: string): Promise<IBooking[]> {
    try {
      return await this.bookingRepo.findByUser(userId, status);
    } catch (error) {
      logger.error('Error in getUserBookings service:', error);
      throw error;
    }
  }

  async getEventBookings(eventId: string, organizerId: string): Promise<IBooking[]> {
    try {
      // Verify organizer owns the event
      const event = await this.eventRepo.findById(eventId);
      if (!event || event.organizerId !== organizerId) {
        throw new Error('Unauthorized to view event bookings');
      }

      return await this.bookingRepo.findByEvent(eventId);
    } catch (error) {
      logger.error('Error in getEventBookings service:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string, userId: string): Promise<IBooking | null> {
    try {
      const booking = await this.bookingRepo.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new Error('Unauthorized to cancel this booking');
      }

      if (booking.status !== 'confirmed') {
        throw new Error('Only confirmed bookings can be cancelled');
      }

      // Check if event is in the future (allow cancellation up to 24 hours before)
      const event = await this.eventRepo.findById(booking.eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (event.date <= twentyFourHoursFromNow) {
        throw new Error('Cannot cancel booking less than 24 hours before event');
      }

      // Update booking status
      const updatedBooking = await this.bookingRepo.updateStatus(bookingId, 'cancelled');

      if (updatedBooking) {
        // Return seats to available pool
        await this.eventRepo.updateAvailableSeats(booking.eventId, -booking.quantity);

        // Update Redis cache
        const availableKey = `event_available:${booking.eventId}`;
        await redisClient.incrby(availableKey, booking.quantity);

        logger.info(`Booking cancelled: ${bookingId}`);
      }

      return updatedBooking;
    } catch (error) {
      logger.error('Error in cancelBooking service:', error);
      throw error;
    }
  }

  async getBookingStats(eventId: string, organizerId: string): Promise<any> {
    try {
      // Verify organizer owns the event
      const event = await this.eventRepo.findById(eventId);
      if (!event || event.organizerId !== organizerId) {
        throw new Error('Unauthorized to view booking stats');
      }

      return await this.bookingRepo.getBookingStats(eventId);
    } catch (error) {
      logger.error('Error in getBookingStats service:', error);
      throw error;
    }
  }

  // Background job: Clean up expired reservations
  async cleanupExpiredReservations(): Promise<number> {
    try {
      const cancelledCount = await this.bookingRepo.cancelExpiredReservations();

      if (cancelledCount > 0) {
        logger.info(`Cleaned up ${cancelledCount} expired reservations`);

        // TODO: Send notifications to affected users
        // TODO: Return seats to available pool
      }

      return cancelledCount;
    } catch (error) {
      logger.error('Error in cleanupExpiredReservations:', error);
      throw error;
    }
  }
}

export default new BookingService();