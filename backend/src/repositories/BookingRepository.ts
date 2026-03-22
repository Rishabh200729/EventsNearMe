import { Booking, IBooking } from '../models/Booking.js';
import { logger } from '../config/logger.js';

export class BookingRepository {
  async create(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const booking = new Booking(bookingData);
      return await booking.save();
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<IBooking | null> {
    try {
      return await Booking.findById(id);
    } catch (error) {
      logger.error('Error finding booking by ID:', error);
      throw error;
    }
  }

  async findByUser(userId: string, status?: string): Promise<IBooking[]> {
    try {
      const query: any = { userId };
      if (status) {
        query.status = status;
      }
      return await Booking.find(query).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error finding bookings by user:', error);
      throw error;
    }
  }

  async findByEvent(eventId: string, status?: string): Promise<IBooking[]> {
    try {
      const query: any = { eventId };
      if (status) {
        query.status = status;
      }
      return await Booking.find(query).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error finding bookings by event:', error);
      throw error;
    }
  }

  async findUserBookingForEvent(userId: string, eventId: string): Promise<IBooking | null> {
    try {
      return await Booking.findOne({
        userId,
        eventId,
        status: { $in: ['reserved', 'confirmed'] }
      });
    } catch (error) {
      logger.error('Error finding user booking for event:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: IBooking['status']): Promise<IBooking | null> {
    try {
      const updateData: any = { status };

      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
        updateData.expiresAt = undefined;
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      return await Booking.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating booking status:', error);
      throw error;
    }
  }

  async findExpiredReservations(): Promise<IBooking[]> {
    try {
      return await Booking.find({
        status: 'reserved',
        expiresAt: { $lt: new Date() }
      });
    } catch (error) {
      logger.error('Error finding expired reservations:', error);
      throw error;
    }
  }

  async cancelExpiredReservations(): Promise<number> {
    try {
      const result = await Booking.updateMany(
        {
          status: 'reserved',
          expiresAt: { $lt: new Date() }
        },
        {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      );
      return result.modifiedCount;
    } catch (error) {
      logger.error('Error cancelling expired reservations:', error);
      throw error;
    }
  }

  async getBookingStats(eventId: string): Promise<{
    total: number;
    confirmed: number;
    reserved: number;
    cancelled: number;
  }> {
    try {
      const stats = await Booking.aggregate([
        { $match: { eventId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        confirmed: 0,
        reserved: 0,
        cancelled: 0
      };

      stats.forEach(stat => {
        result[stat._id as keyof typeof result] = stat.count;
        result.total += stat.count;
      });

      return result;
    } catch (error) {
      logger.error('Error getting booking stats:', error);
      throw error;
    }
  }
}

export default new BookingRepository();