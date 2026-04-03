import amqp from 'amqplib';
import { logger } from '../config/logger.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

let channel: amqp.Channel | null = null;

export async function connectQueue() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('notifications');
    await channel.assertQueue('analytics');
    logger.info('Connected to RabbitMQ');
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ', error);
  }
}

export async function sendNotification(data: any) {
  if (!channel) return;
  await channel.sendToQueue('notifications', Buffer.from(JSON.stringify(data)));
  console.log("SENT NOTIFICATION");
}

export async function sendAnalytics(data: any) {
  if (!channel) return;
  await channel.sendToQueue('analytics', Buffer.from(JSON.stringify(data)));
  console.log("SENT ANALYTICS");
}

setTimeout(async () => {
  await connectQueue();
  sendNotification("Hello from Node.js!");
  sendAnalytics("Analytics data");
}, 10000);