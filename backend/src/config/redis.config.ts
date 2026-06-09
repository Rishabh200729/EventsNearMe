import Redis from 'ioredis';
import { logger } from './logger.js';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const isTls = redisUrl.startsWith('rediss://') || redisUrl.startsWith('tls://');

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  family: 0, // Force IPv4/IPv6 auto-resolution (fixes DNS issues on Render)
  ...(isTls && {
    tls: {
      rejectUnauthorized: false // Required for some managed Redis providers
    }
  })
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
