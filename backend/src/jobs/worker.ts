import { notificationQueue, analyticsQueue } from './jobQueue.js';
import { logger } from '../config/logger.js';

logger.info('🚀 Starting background job worker...');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker...');
  await notificationQueue.close();
  await analyticsQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down worker...');
  await notificationQueue.close();
  await analyticsQueue.close();
  process.exit(0);
});

// Keep the worker running
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception in worker:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection in worker:', reason);
  process.exit(1);
});

logger.info('✅ Worker is running and processing jobs...');