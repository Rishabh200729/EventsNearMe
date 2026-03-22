import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { redisClient } from '../config/redis.config.js';

let mongoServer: MongoMemoryServer;

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

// Increase timeout for connections
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  // Connect to Redis
  if (redisClient.status === 'wait') {
    await redisClient.connect().catch(err => console.error('Redis test connection error:', err));
  }
});

afterAll(async () => {
  // Cleanup MongoDB connection
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }

  // Cleanup Redis connection
  await redisClient.quit();
});