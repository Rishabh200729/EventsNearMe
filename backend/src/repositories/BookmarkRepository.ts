import { Bookmark, IBookmark } from '../models/Bookmark.js';
import { logger } from '../config/logger.js';

class BookmarkRepository {
  async create(eventId: string, userId: string): Promise<IBookmark> {
    try {
      const bookmark = new Bookmark({ eventId, userId });
      return await bookmark.save();
    } catch (error) {
      logger.error('Error creating bookmark:', error);
      throw error;
    }
  }

  async delete(eventId: string, userId: string): Promise<boolean> {
    try {
      const result = await Bookmark.findOneAndDelete({ eventId, userId });
      return !!result;
    } catch (error) {
      logger.error('Error deleting bookmark:', error);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<IBookmark[]> {
    try {
      return await Bookmark.find({ userId });
    } catch (error) {
      logger.error('Error finding bookmarks by user:', error);
      throw error;
    }
  }

  async exists(eventId: string, userId: string): Promise<boolean> {
    try {
      const count = await Bookmark.countDocuments({ eventId, userId });
      return count > 0;
    } catch (error) {
      logger.error('Error checking bookmark existence:', error);
      throw error;
    }
  }
}

export default new BookmarkRepository();
