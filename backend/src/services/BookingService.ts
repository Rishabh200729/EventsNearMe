import BookingRepository from "../repositories/BookingRepository.js";
import EventRepository from "../repositories/EventRepository.js";
import userRepository from "../repositories/UserRepository.js";
import { redisClient } from "../config/redis.config.js";
import { logger } from "../config/logger.js";
import { IBooking } from "../models/Booking.js";
import { publishEmailJob } from "../jobs/emailQueue.js";
import notificationService from "./NotificationService.js";

export class BookingService {
  private bookingRepo = BookingRepository;
  private eventRepo = EventRepository;
  private userRepo = userRepository;

  async createBooking(
    eventId: string,
    userId: string,
    quantity = 1,
  ): Promise<IBooking> {
    const lockKey = `booking_lock:${eventId}`;
    const availableKey = `event_available:${eventId}`;

    // Acquire distributed lock (10 second timeout)
    const lockAcquired = await redisClient.set(
      lockKey,
      "locked",
      "EX",
      10,
      "NX",
    );

    if (!lockAcquired) {
      throw new Error("System busy, please try again");
    }

    try {
      // Get event details
      const event = await this.eventRepo.findById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      if (event.date <= new Date()) {
        throw new Error("Event has already started");
      }

      // Check if user already has a booking
      const existingBooking = await this.bookingRepo.findUserBookingForEvent(
        userId,
        eventId,
      );
      if (existingBooking) {
        throw new Error("You already have a booking for this event");
      }

      // Get current available seats from Redis cache
      const cached = await redisClient.get(availableKey);
      let availableSeats: number;

      // If not in cache, get from database and cache it
      if (cached === null) {
        availableSeats = event.availableSeats;
        await redisClient.set(availableKey, availableSeats.toString());
      } else {
        availableSeats = parseInt(cached);
      }

      if (availableSeats < quantity) {
        throw new Error("Not enough seats available");
      }

      // Calculate total amount
      const totalAmount = event.price * quantity;

      // Create booking
      const booking = await this.bookingRepo.create({
        eventId,
        userId,
        quantity,
        totalAmount,
        status: "confirmed", // Immediate confirmation for simplicity
      });

      // Update available seats in database and cache
      await this.eventRepo.updateAvailableSeats(eventId, quantity);
      await redisClient.decrby(availableKey, quantity);

      // Increment recent bookings for trending
      await this.eventRepo.incrementRecentBookings(eventId);

      logger.info(
        `Booking created: ${booking._id} for event ${eventId} by user ${userId}`,
      );

      // Send real-time notification
      await notificationService.createAndPublish(
        userId,
        "booking_confirmed",
        "Booking Confirmed",
        `Your booking for "${event.title}" (x${quantity}) — $${totalAmount.toFixed(2)}`,
        { eventId, bookingId: booking._id.toString(), quantity, totalAmount },
      );

      // Send email confirmation
      const user = await this.userRepo.findById(userId);
      if (user) {
        logger.info(
          `Sending booking confirmation email to ${user.email} for booking ${booking._id}`,
        );
        await publishEmailJob(user.email, "Booking Confirmation", {
          title: event.title,
          quantity: booking.quantity,
          totalAmount: booking.totalAmount,
        });
      }
      return booking;
    } finally {
      // Always release the lock
      await redisClient.del(lockKey);
    }
  }

  async getUserBookings(userId: string, status?: string): Promise<any[]> {
    try {
      const bookings = await this.bookingRepo.findByUser(userId, status);
      const eventIds = [...new Set(bookings.map((b) => b.eventId))];
      const events = await this.eventRepo.findByIds(eventIds);
      const eventMap = new Map(events.map((e) => [e._id.toString(), e]));

      return bookings.map((booking) => ({
        ...booking.toObject(),
        event: eventMap.get(booking.eventId) || null,
      }));
    } catch (error) {
      logger.error("Error in getUserBookings service:", error);
      throw error;
    }
  }

  async getCheckinInfo(bookingId: string): Promise<any> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const event = await this.eventRepo.findById(booking.eventId);
    const user = await this.userRepo.findById(booking.userId);

    return {
      ...booking.toObject(),
      event: event ? { _id: event._id, title: event.title, date: event.date, category: event.category } : null,
      user: user ? { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
    };
  }

  async getEventBookings(
    eventId: string,
    organizerId: string,
  ): Promise<IBooking[]> {
    try {
      // Verify organizer owns the event
      const event = await this.eventRepo.findById(eventId);
      if (!event || event.organizerId !== organizerId) {
        throw new Error("Unauthorized to view event bookings");
      }

      return await this.bookingRepo.findByEvent(eventId);
    } catch (error) {
      logger.error("Error in getEventBookings service:", error);
      throw error;
    }
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
  ): Promise<IBooking | null> {
    try {
      const booking = await this.bookingRepo.findById(bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.userId !== userId) {
        throw new Error("Unauthorized to cancel this booking");
      }

      if (booking.status !== "confirmed") {
        throw new Error("Only confirmed bookings can be cancelled");
      }

      // Check if event is in the future (allow cancellation up to 24 hours before)
      const event = await this.eventRepo.findById(booking.eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (event.date <= twentyFourHoursFromNow) {
        throw new Error(
          "Cannot cancel booking less than 24 hours before event",
        );
      }

      // Update booking status
      const updatedBooking = await this.bookingRepo.updateStatus(
        bookingId,
        "cancelled",
      );

      if (updatedBooking) {
        // Return seats to available pool
        await this.eventRepo.updateAvailableSeats(
          booking.eventId,
          -booking.quantity,
        );

        // Update Redis cache
        const availableKey = `event_available:${booking.eventId}`;
        await redisClient.incrby(availableKey, booking.quantity);

        logger.info(`Booking cancelled: ${bookingId}`);
      }

      await notificationService.createAndPublish(
        userId,
        "booking_cancelled",
        "Booking Cancelled",
        `Your booking for "${event.title}" has been cancelled.`,
        { eventId: booking.eventId, bookingId },
      );

      return updatedBooking;
    } catch (error) {
      logger.error("Error in cancelBooking service:", error);
      throw error;
    }
  }

  async checkIn(bookingId: string): Promise<IBooking | null> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.checkedIn) throw new Error("Already checked in");
    if (booking.status !== "confirmed")
      throw new Error("Booking is not confirmed");

    const event = await this.eventRepo.findById(booking.eventId);
    if (!event) throw new Error("Event not found");

    return await this.bookingRepo.markAsCheckedIn(bookingId);
  }

  async getBookingStats(eventId: string, organizerId: string): Promise<any> {
    try {
      // Verify organizer owns the event
      const event = await this.eventRepo.findById(eventId);
      if (!event || event.organizerId !== organizerId) {
        throw new Error("Unauthorized to view booking stats");
      }

      return await this.bookingRepo.getBookingStats(eventId);
    } catch (error) {
      logger.error("Error in getBookingStats service:", error);
      throw error;
    }
  }

  // Background job: Clean up expired reservations
  async cleanupExpiredReservations(): Promise<number> {
    try {
      const expiredBookings = await this.bookingRepo.findExpiredReservations();

      if (expiredBookings.length === 0) return 0;

      for (const booking of expiredBookings) {
        // Return seats to available pool
        await this.eventRepo.updateAvailableSeats(booking.eventId, -booking.quantity);

        // Update Redis cache
        const availableKey = `event_available:${booking.eventId}`;
        await redisClient.incrby(availableKey, booking.quantity);

        // Send cancellation notification
        await notificationService.createAndPublish(
          booking.userId,
          "booking_cancelled",
          "Booking Expired",
          "Your reservation has expired because payment was not completed within the time limit.",
          { eventId: booking.eventId, bookingId: booking._id.toString() }
        );
      }

      const cancelledCount = await this.bookingRepo.cancelExpiredReservations();
      logger.info(`Cleaned up ${cancelledCount} expired reservations`);
      return cancelledCount;
    } catch (error) {
      logger.error('Error in cleanupExpiredReservations:', error);
      throw error;
    }
  }
}

export default new BookingService();
