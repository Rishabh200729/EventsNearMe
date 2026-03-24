// npx tsx src/jobs/createjobs.ts

import { notificationQueue, analyticsQueue } from './jobQueue.js';
import { logger } from '../config/logger.js';

async function createJobs() {
    await notificationQueue.add("send_booking_confirmation", {
        bookingId: 'booking123'
    });
}
createJobs().then(() => {
    logger.info('Jobs created successfully');
    process.exit(0);
}).catch((err) => {
    logger.error('Error creating jobs', err);
    process.exit(1);
});