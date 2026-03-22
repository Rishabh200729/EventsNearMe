import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { redisClient } from '../config/redis.config.js';
import { logger } from '../config/logger.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

      // Check if token is blacklisted (for logout)
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        res.status(401).json({
          success: false,
          error: 'Token has been invalidated'
        });
        return;
      }

      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'No user found with this token'
        });
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      logger.error('JWT verification failed:', err);
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check if user is organizer or admin
export const requireOrganizer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  console.log(req.user);
  if (req.user && (req.user.role === 'organizer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. Organizer or admin role required.'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. Admin role required.'
    });
  }
};

export default authenticate;