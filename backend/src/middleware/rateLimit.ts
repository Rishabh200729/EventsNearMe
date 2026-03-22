import rateLimit from 'express-rate-limit';
import { redisClient } from '../config/redis.config.js';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Strict limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// Booking limiter (more restrictive)
export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 booking attempts per minute
  message: {
    success: false,
    error: 'Too many booking attempts, please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom Redis-based rate limiter for more complex scenarios
export const createRedisLimiter = (key: string, windowMs: number, maxRequests: number) => {
  return async (req: any, res: any, next: any) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const redisKey = `${key}:${clientIP}`;

    try {
      const current = await redisClient.incr(redisKey);

      if (current === 1) {
        // Set expiry for the key
        await redisClient.expire(redisKey, Math.floor(windowMs / 1000));
      }

      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          error: `Rate limit exceeded. Try again in ${Math.floor(windowMs / 1000)} seconds.`
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Continue if Redis fails
    }
  };
};

export default apiLimiter;