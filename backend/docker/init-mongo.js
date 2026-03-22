// MongoDB initialization script
// This runs when the MongoDB container starts for the first time

// Create geospatial index for events collection
db.events.createIndex({ location: "2dsphere" });

// Create indexes for better performance
db.events.createIndex({ date: 1 });
db.events.createIndex({ category: 1 });
db.events.createIndex({ organizerId: 1 });
db.events.createIndex({ createdAt: -1 });

db.bookings.createIndex({ eventId: 1, userId: 1 });
db.bookings.createIndex({ userId: 1, status: 1 });
db.bookings.createIndex({ status: 1, expiresAt: 1 });
db.bookings.createIndex({ createdAt: -1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Create a default admin user (optional)
db.users.insertOne({
  email: "admin@eventsnearme.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8GqHBzMzO", // "admin123"
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isEmailVerified: true,
  preferences: {
    notifications: true,
    categories: []
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully!");