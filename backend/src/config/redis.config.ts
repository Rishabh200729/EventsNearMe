import Redis from 'ioredis';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis', redisClient);
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('ready', () => {
  console.log('🚀 Redis client ready');
});

export default redisClient;
