import { User } from './models/User.js';
import { logger } from './config/logger.js';

const DEMO_USERS = [
  {
    email: 'demo@eventsnearme.com',
    password: 'demo1234',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user' as const,
    isEmailVerified: true,
  },
  {
    email: 'organizer@eventsnearme.com',
    password: 'demo1234',
    firstName: 'Demo',
    lastName: 'Organizer',
    role: 'organizer' as const,
    isEmailVerified: true,
  },
];

export async function seedDemoUsers(): Promise<void> {
  for (const userData of DEMO_USERS) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) {
      await User.create(userData);
      logger.info(`Demo user created: ${userData.email}`);
    }
  }
}
