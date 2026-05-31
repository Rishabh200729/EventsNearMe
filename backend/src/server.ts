import app from './app.js';
import { logger } from './config/logger.js';
import { connectDB } from './config/database.js';
import { redisClient } from './config/redis.config.js';
import { seedDemoUsers } from './seed.js';
import { connectQueue } from './jobs/emailQueue.js';

const PORT = process.env.PORT || 5000;

// Connect to databases
await connectDB();
await seedDemoUsers();
redisClient.connect().catch(console.error);
connectQueue();

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    await redisClient.quit();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
