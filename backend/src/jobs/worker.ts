import amqp from "amqplib";
import { logger } from "../config/logger.js";

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function startWorker() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue('notifications');
    await channel.assertQueue('analytics');

    logger.info('Worker connected to RabbitMQ');

    // Notification worker
    channel.consume('notifications', (msg: any) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        logger.info('Processing notification:', data);
        // TODO: Implement actual notification sending
        channel.ack(msg);
      }
    });

    // Analytics worker
    channel.consume('analytics', (msg: any) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        logger.info('Processing analytics:', data);
        // TODO: Implement actual analytics processing
        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error('Failed to start worker', error);
  }
}
async function start() {
  await startWorker();
}
start();