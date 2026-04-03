# EventsNearMe

> **A scalable, highly-performant event discovery platform to find and create real-time local events.**

![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)

EventsNearMe is a modern, full-stack application that allows users to discover exciting events happening in their vicinity. It features a responsive UI with location-based mapping, robust backend architecture powered by Node.js, and background job processing for high performance.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js (App Router), React 19
- **Styling:** Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Data Fetching:** SWR (for real-time synchronization and caching)
- **Mapping:** React-Leaflet (Interactive location-based map views)

### Backend
- **Framework:** Node.js, Express.js (TypeScript)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** Custom JWT-based Auth with bcryptjs
- **Caching & Brokers:** Redis
- **Job Processing:** RabbitMQ & Bull (Background worker architecture)

### Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose (Frontend, Backend, Worker, MongoDB, Redis, RabbitMQ)
- **Package Managers:** npm / bun / tsx

---

## ✨ Features

###  Currently Supported (MVP)
- **User Authentication:** Secure JWT-based login and registration system.
- **Event Management:** Users can seamlessly create, browse, and manage events.
- **Location Mapping:** View events pinned on an interactive map near your geographical location.
- **Real-time UI Updates:** Leveraging SWR in components like `NearbyEvents` to instantly reflect fetching, mutating, and cached data without full-page reloads.
- **Fully Dockerized Environment:** Isolated containers for different microservices, ensuring seamless environment setup.

### 🚧 In Progress / Upcoming
- **Asynchronous Background Jobs:** Actively developing and refining the Bull/RabbitMQ worker queue architecture for tasks like email notifications, heavy data processing, and scheduled cron jobs.
- **Advanced Search & Filtering:** Improving the event discovery mechanism with full-text search and category filtering.
- **Optimized Caching Layer:** Expanding Redis caching integration across more endpoints to aggressively reduce database lookups.
- **Performance Profiling:** Fine-tuning Next.js SSR performance.

---

## 🚀 Getting Started

The easiest way to run this application locally is by using **Docker Compose**, which will automatically spin up the database, cache, message broker, backend API, frontend server, and worker node.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose installed.
- Node.js (v20+) if manually running outside containers.

### Installation using Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/EventsNearMe.git
   cd EventsNearMe
   ```

2. **Set up Environment Variables:**
   You will need to configure `.env` files in both the frontend and backend.
   - For backend: Create `backend/.env` containing your `JWT_SECRET`, `MONGODB_URI`, `REDIS_URL`, etc.
   - For frontend: Create `frontend/.env.local` containing your backend API URLs.
   *(Note: The `docker-compose.yml` inherently provides default connection strings for local container communication).*

3. **Start the containers:**
   ```bash
   docker-compose up --build
   ```
   This command starts the following services:
   - `frontend` (Accessible at `http://localhost:3000`)
   - `backend` (Accessible at `http://localhost:5000`)
   - `worker` (Background jobs)
   - `mongodb` (Port `27017`)
   - `redis` (Port `6379`)
   - `rabbitmq` (Dashboard accessible at `http://localhost:15672`)

4. **Stop the containers:**
   ```bash
   docker-compose down
   ```

---

## 📂 Project Structure

```text
EventsNearMe/
├── backend/                  # Express/Node.js API
│   ├── docker/               # Backend-specific Dockerfiles
│   └── src/
│       ├── controllers/      # Route handlers
│       ├── jobs/             # Bull workers and queue setup
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express routes
│       └── server.ts         # Backend entry point
├── frontend/                 # Next.js Application
│   ├── app/                  # Next.js 13+ App Router
│   ├── components/           # Reusable UI components (e.g., NearbyEvents)
│   ├── lib/                  # Utility functions
│   └── public/               # Static assets
└── docker-compose.yml        # Orchestrates the multi-container architecture
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project, please open an issue first to discuss what you would like to change. 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
