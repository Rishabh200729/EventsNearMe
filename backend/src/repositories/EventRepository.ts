import { Event, IEvent } from '../models/Event.js';
import { logger } from '../config/logger.js';
import { Types } from 'mongoose';

export class EventRepository {
  async create(eventData: Partial<IEvent>): Promise<IEvent> {
    try {
      const event = new Event(eventData);
      return await event.save();
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  async findById(id: Types.ObjectId): Promise<IEvent | null> {
    try {
      return await Event.findById(id).populate('organizerId', 'firstName lastName');
    } catch (error) {
      logger.error('Error finding event by ID:', error);
      throw error;
    }
  }

  async findByOrganizer(organizerId: string, limit = 50): Promise<IEvent[]> {
    try {
      return await Event.find({ organizerId })
        .populate('organizerId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error finding events by organizer:', error);
      throw error;
    }
  }

  async findNearby(
    longitude: number,
    latitude: number,
    maxDistance = 5000,
    limit = 50
  ): Promise<IEvent[]> {
    try {
      return await Event.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        },
        date: { $gte: new Date() } // Only upcoming events
      })
        .populate('organizerId', 'firstName lastName')
        .sort({ date: 1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error finding nearby events:', error);
      throw error;
    }
  }

  async findByCategory(category: string, limit = 50): Promise<IEvent[]> {
    try {
      return await Event.find({
        category,
        date: { $gte: new Date() }
      })
        .populate('organizerId', 'firstName lastName')
        .sort({ date: 1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error finding events by category:', error);
      throw error;
    }
  }

  async update(id: string, updateData: Partial<IEvent>): Promise<IEvent | null> {
    try {
      return await Event.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error('Error updating event:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Event.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error('Error deleting event:', error);
      throw error;
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await Event.findByIdAndUpdate(id, { $inc: { views: 1 } });
    } catch (error) {
      logger.error('Error incrementing event views:', error);
      throw error;
    }
  }

  async incrementBookmarks(id: string): Promise<void> {
    try {
      await Event.findByIdAndUpdate(id, { $inc: { bookmarks: 1 } });
    } catch (error) {
      logger.error('Error incrementing event bookmarks:', error);
      throw error;
    }
  }

  async decrementBookmarks(id: string): Promise<void> {
    try {
      await Event.findByIdAndUpdate(id, { $inc: { bookmarks: -1 } });
    } catch (error) {
      logger.error('Error decrementing event bookmarks:', error);
      throw error;
    }
  }

  async incrementRecentBookings(id: string): Promise<void> {
    try {
      await Event.findByIdAndUpdate(id, { $inc: { recentBookings: 1 } });
    } catch (error) {
      logger.error('Error incrementing recent bookings:', error);
      throw error;
    }
  }

  async updateAvailableSeats(id: string, decrement: number): Promise<IEvent | null> {
    try {
      return await Event.findByIdAndUpdate(
        id,
        { $inc: { availableSeats: -decrement } },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating available seats:', error);
      throw error;
    }
  }

  async getTrending(limit = 50): Promise<IEvent[]> {
    try {
      const events = await Event.find({
        date: { $gte: new Date() }
      })
        .populate('organizerId', 'firstName lastName')
        .sort({ createdAt: -1 }).limit(200); // Get recent events

      // Calculate trending score
      const trendingEvents = events.map(event => ({
        ...event.toObject(),
        score: (event.views * 0.3) + (event.bookmarks * 0.5) + (event.recentBookings * 0.2)
      }));

      return trendingEvents
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting trending events:', error);
      throw error;
    }
  }
}

export default new EventRepository();