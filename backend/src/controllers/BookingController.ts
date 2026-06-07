import { Request, Response, NextFunction } from "express";
import BookingService from '../services/BookingService.js';
import { AuthRequest } from '../middleware/auth.js';

export class BookingController {
  private bookingService = BookingService;

  // Create booking
  createBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId } = req.params;
      const { quantity = 1 } = req.body;

      const booking = await this.bookingService.createBooking(
        eventId as string,
        req.user!._id,
        quantity
      );

      res.status(201).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user bookings
  getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.query;

      const bookings = await this.bookingService.getUserBookings(
        req.user!._id,
        status as string
      );

      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  };

  // Get event bookings (organizer only)
  getEventBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId } = req.params;

      const bookings = await this.bookingService.getEventBookings(
        eventId as string,
        req.user!._id
      );

      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      next(error);
    }
  };

  // Cancel booking
  cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const booking = await this.bookingService.cancelBooking(id as string, req.user!._id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
        return;
      }

      res.json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  };
  getCheckinInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const info = await this.bookingService.getCheckinInfo(id as string, req.user!._id);
      res.json({ success: true, data: info });
    } catch (error) {
      next(error);
    }
  };

  checkInUser = async(req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const booking = await this.bookingService.checkIn(id as string, req.user!._id);
      res.json({ success : true , data : booking});
    }catch(error){
      next(error);
    }
  }

  // Get booking stats (organizer only)
  getBookingStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId } = req.params;

      const stats = await this.bookingService.getBookingStats(eventId as string, req.user!._id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  // Join waitlist
  joinWaitlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId } = req.params;
      const { quantity = 1 } = req.body;

      const result = await this.bookingService.joinWaitlist(
        eventId as string,
        req.user!._id,
        quantity
      );

      res.status(201).json({
        success: true,
        data: result,
        message: `You are #${result.position} on the waitlist`
      });
    } catch (error) {
      next(error);
    }
  };

  // Leave waitlist
  leaveWaitlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId } = req.params;

      await this.bookingService.leaveWaitlist(eventId as string, req.user!._id);

      res.json({
        success: true,
        message: 'Removed from waitlist'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get waitlist status
  getWaitlistStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId } = req.params;

      const status = await this.bookingService.getWaitlistStatus(eventId as string, req.user!._id);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  };

  // Get full waitlist (Organizer)
  getEventWaitlist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId } = req.params;

      const waitlist = await this.bookingService.getEventWaitlist(eventId as string, req.user!._id);

      res.json({
        success: true,
        data: waitlist
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new BookingController();