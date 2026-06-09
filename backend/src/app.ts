import express from 'express';
import dotenv from 'dotenv';
// Load environment variables before importing other modules
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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

// Temporary debug endpoint - echoes request headers
app.get('/api/debug/headers', (req, res) => {
  res.json({
    hasAuth: !!req.headers.authorization,
    authPrefix: req.headers.authorization?.substring(0, 20),
    hasCookie: !!req.headers.cookie,
    cookieValue: req.headers.cookie?.substring(0, 30),
    parsedCookies: Object.keys(req.cookies || {}),
    allHeaderKeys: Object.keys(req.headers)
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;