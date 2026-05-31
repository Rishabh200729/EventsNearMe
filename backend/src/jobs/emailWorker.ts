import dotenv from 'dotenv';
dotenv.config();

import amqp from 'amqplib';
import { logger } from '../config/logger.js';
import { EmailService } from '../services/EmailService.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'email_notifications';
const MAX_RETRIES = 15;
const RETRY_DELAY_MS = 2000;

async function connectWithRetry(attempt = 1): Promise<amqp.Channel> {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);
    return channel;
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      logger.error(`❌ Failed to connect to RabbitMQ after ${MAX_RETRIES} attempts`);
      throw error;
    }
    logger.info(`⏳ Waiting for RabbitMQ (attempt ${attempt}/${MAX_RETRIES})...`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectWithRetry(attempt + 1);
  }
}

async function startWorker() {
  try {
    const channel = await connectWithRetry();
    logger.info('📧 Email worker connected to RabbitMQ');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const { to, subject, bookingDetails } = JSON.parse(msg.content.toString());
        logger.info(`Sending email to ${to} for booking`);

        await EmailService.sendBookingConfirmationEmail(to, subject, bookingDetails);

        channel.ack(msg);
        logger.info(`✅ Email sent to ${to}`);
      } catch (error) {
        logger.error(`❌ Failed to process email job:`, error);
        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start email worker', error);
    process.exit(1);
  }
}

startWorker();
