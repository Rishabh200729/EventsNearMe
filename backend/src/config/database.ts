import mongoose from 'mongoose';
import { logger } from './logger.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsnearme';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ Connected to MongoDB');
    console.log('✅ Connected to MongoDB');

    // Create geospatial indexes
    const db = mongoose.connection.db;
    if (db) {
      await db.collection('events').createIndex({ location: '2dsphere' });
      logger.info('✅ Geospatial index created');
    }
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB connection error:', error);
});

export default mongoose;