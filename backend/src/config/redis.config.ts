import Redis from 'ioredis';
import { logger } from './logger.js';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redisClient.on('connect', () => {
  logger.info('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis Client Error:', err);
});

redisClient.on('ready', () => {
  logger.info('🚀 Redis client ready');
});

export default redisClient;
