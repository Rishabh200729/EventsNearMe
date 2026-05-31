import amqp from 'amqplib';
import { logger } from '../config/logger.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'email_notifications';
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

let channel: amqp.Channel | null = null;

export async function connectQueue(attempt = 1): Promise<void> {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    logger.info('✅ Connected to RabbitMQ');
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      logger.error('❌ Failed to connect to RabbitMQ after max retries', error);
      return;
    }
    logger.info(`⏳ Waiting for RabbitMQ (attempt ${attempt}/${MAX_RETRIES})...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectQueue(attempt + 1);
  }
}

export async function publishEmailJob(
  to: string,
  subject: string,
  bookingDetails: { title: string; quantity: number; totalAmount: number }
) {
  if (!channel) {
    logger.error('RabbitMQ channel not available, email not queued');
    return;
  }

  const message = { to, subject, bookingDetails };
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  logger.info(`📧 Email job queued for ${to}`);
}
