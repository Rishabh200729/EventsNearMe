// Event categories
export const EVENT_CATEGORIES = [
  'music',
  'sports',
  'technology',
  'food',
  'art',
  'business',
  'education',
  'other'
] as const;

// User roles
export const USER_ROLES = [
  'user',
  'organizer',
  'admin'
] as const;

// Booking statuses
export const BOOKING_STATUSES = [
  'reserved',
  'confirmed',
  'cancelled',
  'refunded'
] as const;

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  NEARBY_EVENTS: 300, // 5 minutes
  TRENDING_EVENTS: 600, // 10 minutes
  EVENT_DETAILS: 1800, // 30 minutes
  USER_PROFILE: 3600, // 1 hour
} as const;

// Rate limiting
export const RATE_LIMITS = {
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5
  },
  BOOKING: {
    windowMs: 60 * 1000, // 1 minute
    max: 3
  }
} as const;

// Geospatial constants
export const GEO = {
  EARTH_RADIUS_KM: 6371,
  DEFAULT_SEARCH_RADIUS_KM: 5,
  MAX_SEARCH_RADIUS_KM: 50
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// JWT settings
export const JWT = {
  SECRET: process.env.JWT_SECRET || 'fallback_secret',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
} as const;

// File upload settings
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5
} as const;

// Email settings (for future implementation)
export const EMAIL = {
  FROM: process.env.EMAIL_FROM || 'noreply@eventsnearme.com',
  TEMPLATES: {
    WELCOME: 'welcome',
    BOOKING_CONFIRMATION: 'booking-confirmation',
    PASSWORD_RESET: 'password-reset',
    EVENT_NOTIFICATION: 'event-notification'
  }
} as const;