import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['user', 'organizer']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  date: z.string().refine((date) => {
    const eventDate = new Date(date);
    return eventDate > new Date();
  }, 'Event date must be in the future'),
  category: z.enum(['music', 'sports', 'technology', 'food', 'art', 'business', 'education', 'other']),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional()
  }),
  capacity: z.number().int().min(1).max(100000),
  price: z.number().min(0).default(0),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional()
});

export const updateEventSchema = createEventSchema.partial();

// Booking validation schemas
export const createBookingSchema = z.object({
  quantity: z.number().int().min(1).max(10).default(1)
});

// Query parameter validation
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val)).refine(val => val > 0).optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100).optional(),
  sort: z.string().optional()
});

export const nearbyEventsSchema = z.object({
  lat: z.string().transform(val => parseFloat(val)).refine(val => val >= -90 && val <= 90),
  lng: z.string().transform(val => parseFloat(val)).refine(val => val >= -180 && val <= 180),
  radius: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 50000).optional(),
  limit: z.string().transform(val => parseInt(val)).refine(val => val > 0 && val <= 100).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;