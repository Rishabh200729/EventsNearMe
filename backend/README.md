# EventsNearMe Backend API

A scalable backend system for discovering nearby events, booking tickets, and processing event data.

## 🚀 Features

- **Location-Based Event Discovery**: Geospatial queries with MongoDB 2dsphere indexes
- **Event Management**: Full CRUD operations for events
- **Ticket Booking**: Concurrency-safe booking with Redis locking
- **Trending Events**: Algorithm-based event ranking
- **Caching**: Redis-based performance optimization
- **Background Jobs**: Asynchronous processing with Bull queues
- **Authentication**: JWT-based auth with role management
- **Rate Limiting**: Protection against abuse
- **API Documentation**: Swagger/OpenAPI specs

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Job Queue**: Bull (Redis-based)
- **Validation**: Zod schemas
- **Authentication**: JWT
- **Logging**: Winston
- **Testing**: Jest + Supertest

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database, Redis, Logger configs
│   ├── middleware/       # Auth, validation, rate limiting
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   ├── controllers/     # Route handlers
│   ├── routes/          # API route definitions
│   ├── jobs/            # Background job processors
│   ├── utils/           # Helpers, constants, validators
│   └── tests/           # Unit & integration tests
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── jest.config.json     # Test configuration
└── package.json         # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- npm or yarn

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start MongoDB and Redis**
   ```bash
   # MongoDB (if using local)
   mongod

   # Redis (if using local)
   redis-server
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
```

### Event Endpoints

```http
GET    /api/events/nearby?lat=30.7333&lng=76.7794&radius=10
GET    /api/events/trending
GET    /api/events
POST   /api/events          # Organizer only
GET    /api/events/:id
PUT    /api/events/:id      # Organizer only
DELETE /api/events/:id      # Organizer only
POST   /api/events/:id/bookmark
```

### Booking Endpoints

```http
POST   /api/bookings/events/:eventId
GET    /api/bookings
DELETE /api/bookings/:id
GET    /api/bookings/events/:eventId/stats  # Organizer only
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🔧 Development Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run tests
```

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: API abuse protection
- **Input Validation**: Zod schema validation
- **CORS**: Cross-origin resource sharing control
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds

## 📊 Performance Optimizations

- **Redis Caching**: Frequently accessed data
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Background Processing**: Non-blocking operations
- **Geospatial Indexing**: Fast location queries

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t eventsnearme-backend .

# Run container
docker run -p 5000:5000 eventsnearme-backend
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/eventsnearme |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.