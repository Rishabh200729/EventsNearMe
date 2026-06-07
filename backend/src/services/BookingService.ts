import BookingRepository from "../repositories/BookingRepository.js";
import EventRepository from "../repositories/EventRepository.js";
import userRepository from "../repositories/UserRepository.js";
import WaitlistRepository from "../repositories/WaitlistRepository.js";
import { redisClient } from "../config/redis.config.js";
import { logger } from "../config/logger.js";
import { IBooking } from "../models/Booking.js";
import { publishEmailJob } from "../jobs/emailQueue.js";
import notificationService from "./NotificationService.js";

export class BookingService {
  private bookingRepo = BookingRepository;
  private eventRepo = EventRepository;
  private userRepo = userRepository;
  private waitlistRepo = WaitlistRepository;

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

      if (event.date <= new Date() || event.status === 'completed') {
        throw new Error("Event has already started or completed");
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

  async getCheckinInfo(bookingId: string, organizerId?: string): Promise<any> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    const event = await this.eventRepo.findById(booking.eventId);
    if (!event) throw new Error("Event not found");

    const eventOrganizerId = (event.organizerId as any)?._id?.toString() || event.organizerId.toString();
    if (organizerId && eventOrganizerId !== organizerId.toString()) {
      throw new Error("Unauthorized: this booking belongs to an event you don't own");
    }

    const user = await this.userRepo.findById(booking.userId);

    return {
      ...booking.toObject(),
      event: { _id: event._id, title: event.title, date: event.date, category: event.category },
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
      const eventOrganizerId = event ? ((event.organizerId as any)?._id?.toString() || event.organizerId.toString()) : null;
      if (!event || eventOrganizerId !== organizerId.toString()) {
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

        // Auto-promote from waitlist
        await this.promoteFromWaitlist(booking.eventId);
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

  async checkIn(bookingId: string, organizerId?: string): Promise<IBooking | null> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.checkedIn) throw new Error("Already checked in");
    if (booking.status !== "confirmed")
      throw new Error("Booking is not confirmed");

    const event = await this.eventRepo.findById(booking.eventId);
    if (!event) throw new Error("Event not found");

    const eventOrganizerId = (event.organizerId as any)?._id?.toString() || event.organizerId.toString();
    if (organizerId && eventOrganizerId !== organizerId.toString()) {
      throw new Error("Unauthorized: this booking belongs to an event you don't own");
    }

    return await this.bookingRepo.markAsCheckedIn(bookingId);
  }

  async getBookingStats(eventId: string, organizerId: string): Promise<any> {
    try {
      // Verify organizer owns the event
      const event = await this.eventRepo.findById(eventId);
      const eventOrganizerId = event ? ((event.organizerId as any)?._id?.toString() || event.organizerId.toString()) : null;
      if (!event || eventOrganizerId !== organizerId.toString()) {
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

  // ── Waitlist Methods ──

  async joinWaitlist(eventId: string, userId: string, quantity = 1): Promise<any> {
    try {
      const event = await this.eventRepo.findById(eventId);
      if (!event) throw new Error("Event not found");

      if (event.status !== 'upcoming' || event.date <= new Date()) {
        throw new Error("Cannot join waitlist for past or completed events");
      }

      // Check if user already has a booking
      const existingBooking = await this.bookingRepo.findUserBookingForEvent(userId, eventId);
      if (existingBooking) {
        throw new Error("You already have a booking for this event");
      }

      // Check if user is already on the waitlist
      const existingWaitlist = await this.waitlistRepo.findByEventAndUser(eventId, userId);
      if (existingWaitlist) {
        throw new Error("You are already on the waitlist for this event");
      }

      // Only allow joining waitlist if the event is full
      if (event.availableSeats >= quantity) {
        throw new Error("Seats are still available — book directly instead");
      }

      const entry = await this.waitlistRepo.add(eventId, userId, quantity);
      const position = await this.waitlistRepo.getPosition(eventId, userId);

      // Notify the user
      await notificationService.createAndPublish(
        userId,
        "waitlist_joined",
        "Waitlist Joined",
        `You are #${position} on the waitlist for "${event.title}".`,
        { eventId, position }
      );

      logger.info(`User ${userId} joined waitlist for event ${eventId} at position ${position}`);

      return { entry, position };
    } catch (error) {
      logger.error("Error in joinWaitlist service:", error);
      throw error;
    }
  }

  async leaveWaitlist(eventId: string, userId: string): Promise<boolean> {
    try {
      const removed = await this.waitlistRepo.remove(eventId, userId);
      if (!removed) throw new Error("You are not on the waitlist for this event");

      logger.info(`User ${userId} left waitlist for event ${eventId}`);
      return true;
    } catch (error) {
      logger.error("Error in leaveWaitlist service:", error);
      throw error;
    }
  }

  async getWaitlistStatus(eventId: string, userId: string): Promise<any> {
    try {
      const entry = await this.waitlistRepo.findByEventAndUser(eventId, userId);
      if (!entry) {
        return { onWaitlist: false, position: -1, total: await this.waitlistRepo.getWaitlistCount(eventId) };
      }
      const position = await this.waitlistRepo.getPosition(eventId, userId);
      const total = await this.waitlistRepo.getWaitlistCount(eventId);
      return { onWaitlist: true, position, total, quantity: entry.quantity };
    } catch (error) {
      logger.error("Error in getWaitlistStatus service:", error);
      throw error;
    }
  }

  async getEventWaitlist(eventId: string, organizerId: string): Promise<any[]> {
    try {
      const event = await this.eventRepo.findById(eventId);
      const eventOrganizerId = event ? ((event.organizerId as any)?._id?.toString() || event.organizerId.toString()) : null;
      if (!event || eventOrganizerId !== organizerId.toString()) {
        throw new Error("Unauthorized to view waitlist");
      }

      const waitlist = await this.waitlistRepo.getEventWaitlist(eventId);
      
      // Populate user info manually since Waitlist doesn't populate by default
      const populatedWaitlist = await Promise.all(waitlist.map(async (entry, index) => {
        const user = await this.userRepo.findById(entry.userId);
        return {
          ...entry.toObject(),
          position: index + 1,
          user: user ? { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null
        };
      }));

      return populatedWaitlist;
    } catch (error) {
      logger.error("Error in getEventWaitlist service:", error);
      throw error;
    }
  }

  private async promoteFromWaitlist(eventId: string): Promise<void> {
    try {
      const event = await this.eventRepo.findById(eventId);
      if (!event || event.status !== 'upcoming' || event.date <= new Date()) return;

      // Keep promoting while seats are available and people are waiting
      let availableSeats = event.availableSeats;
      while (availableSeats > 0) {
        const nextInLine = await this.waitlistRepo.findNextInLine(eventId);
        if (!nextInLine) break;

        if (nextInLine.quantity > availableSeats) break;

        // Remove from waitlist
        await this.waitlistRepo.remove(eventId, nextInLine.userId);

        // Create confirmed booking
        const totalAmount = event.price * nextInLine.quantity;
        const booking = await this.bookingRepo.create({
          eventId,
          userId: nextInLine.userId,
          quantity: nextInLine.quantity,
          totalAmount,
          status: "confirmed",
        });

        // Deduct seats
        await this.eventRepo.updateAvailableSeats(eventId, nextInLine.quantity);
        const availableKey = `event_available:${eventId}`;
        await redisClient.decrby(availableKey, nextInLine.quantity);
        availableSeats -= nextInLine.quantity;

        // Increment recent bookings for trending
        await this.eventRepo.incrementRecentBookings(eventId);

        // Notify promoted user
        await notificationService.createAndPublish(
          nextInLine.userId,
          "waitlist_promoted",
          "You Got a Spot!",
          `A spot opened up for "${event.title}"! Your booking (x${nextInLine.quantity}) — $${totalAmount.toFixed(2)} has been confirmed.`,
          { eventId, bookingId: booking._id.toString(), quantity: nextInLine.quantity, totalAmount }
        );

        // Send email
        const user = await this.userRepo.findById(nextInLine.userId);
        if (user) {
          await publishEmailJob(user.email, "Waitlist Promotion — Booking Confirmed", {
            title: event.title,
            quantity: nextInLine.quantity,
            totalAmount,
          });
        }

        logger.info(`Promoted user ${nextInLine.userId} from waitlist for event ${eventId}`);
      }
    } catch (error) {
      logger.error("Error in promoteFromWaitlist:", error);
    }
  }
}

export default new BookingService();
