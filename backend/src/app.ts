import express from 'express';
import dotenv from 'dotenv';
// Load environment variables before importing other modules
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/database.js';
import { redisClient } from './config/redis.config.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import { logger } from './config/logger.js';

const app = express();

// Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Temporary debug endpoint - tests JWT verification
app.get('/api/debug/headers', (req, res) => {
  let token = '';
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token && req.cookies?.auth_token) {
    token = req.cookies.auth_token;
  }

  let verifyResult = 'no token found';
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      verifyResult = `OK - userId: ${decoded.id}, exp: ${new Date((decoded.exp || 0) * 1000).toISOString()}`;
    } catch (e: any) {
      verifyResult = `FAILED: ${e.message}`;
    }
  }

  res.json({
    tokenFound: !!token,
    tokenPrefix: token ? token.substring(0, 15) + '...' : 'none',
    jwtVerify: verifyResult,
    jwtSecretSet: !!process.env.JWT_SECRET,
    jwtSecretLength: (process.env.JWT_SECRET || '').length
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;