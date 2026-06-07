import { Waitlist, IWaitlist } from '../models/Waitlist.js';
import { logger } from '../config/logger.js';

export class WaitlistRepository {
  async add(eventId: string, userId: string, quantity: number): Promise<IWaitlist> {
    try {
      const entry = new Waitlist({ eventId, userId, quantity });
      return await entry.save();
    } catch (error) {
      logger.error('Error adding to waitlist:', error);
      throw error;
    }
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<IWaitlist | null> {
    try {
      return await Waitlist.findOne({ eventId, userId });
    } catch (error) {
      logger.error('Error finding waitlist entry:', error);
      throw error;
    }
  }

  async findNextInLine(eventId: string): Promise<IWaitlist | null> {
    try {
      return await Waitlist.findOne({ eventId }).sort({ createdAt: 1 });
    } catch (error) {
      logger.error('Error finding next in waitlist:', error);
      throw error;
    }
  }

  async remove(eventId: string, userId: string): Promise<boolean> {
    try {
      const result = await Waitlist.findOneAndDelete({ eventId, userId });
      return !!result;
    } catch (error) {
      logger.error('Error removing from waitlist:', error);
      throw error;
    }
  }

  async getPosition(eventId: string, userId: string): Promise<number> {
    try {
      const entries = await Waitlist.find({ eventId }).sort({ createdAt: 1 }).select('userId');
      const index = entries.findIndex(e => e.userId === userId);
      return index === -1 ? -1 : index + 1;
    } catch (error) {
      logger.error('Error getting waitlist position:', error);
      throw error;
    }
  }

  async getWaitlistCount(eventId: string): Promise<number> {
    try {
      return await Waitlist.countDocuments({ eventId });
    } catch (error) {
      logger.error('Error counting waitlist:', error);
      throw error;
    }
  }

  async getEventWaitlist(eventId: string): Promise<IWaitlist[]> {
    try {
      return await Waitlist.find({ eventId }).sort({ createdAt: 1 });
    } catch (error) {
      logger.error('Error getting event waitlist:', error);
      throw error;
    }
  }
}

export default new WaitlistRepository();
