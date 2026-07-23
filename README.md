<div align="center">

# 🌍 TOGO — Tour Management System (Backend API)

**A robust, scalable REST API powering the TOGO tour & travel management platform.**

[![Live API](https://img.shields.io/badge/api-live-brightgreen?style=for-the-badge)](https://dreams-tour-management-system-backe.vercel.app)
[![Frontend](https://img.shields.io/badge/frontend-live-blue?style=for-the-badge)](https://tour-management-jet.vercel.app)

[Live API](https://dreams-tour-management-system-backe.vercel.app) · [Frontend App](https://tour-management-jet.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 About The Project

This is the **backend service** for **TOGO**, a modern tour management platform. It exposes a secure, well-structured REST API that handles tours, bookings, users, authentication, and caching — built with an industry-standard Node.js stack for reliability, type safety, and performance.

---

## ✨ Features

- 🔐 **Authentication & Authorization** — JWT-based auth with role-based access control
- 🧳 **Tour Management** — Full CRUD for tours, categories, and packages
- 📅 **Booking System** — Create, update, and track bookings
- ⚡ **Redis Caching** — Faster response times for frequently accessed data
- 🧵 **MongoDB + Mongoose** — Flexible, schema-based NoSQL data modeling
- 🛡️ **Input Validation** — Request validation & sanitization
- 🌐 **RESTful API Design** — Clean, predictable, versioned endpoints
- 📄 **Centralized Error Handling** — Consistent error responses
- 🪵 **Logging** — Request & error logging for observability
- ☁️ **Production Ready** — Deployed on Vercel

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Express.js](https://expressjs.com/) | Web application framework |
| [TypeScript](https://www.typescriptlang.org/) | Static typing & developer safety |
| [MongoDB](https://www.mongodb.com/) | NoSQL database |
| [Mongoose](https://mongoosejs.com/) | ODM for MongoDB schema modeling |
| [Redis](https://redis.io/) | In-memory caching & session store |
| [JWT](https://jwt.io/) | Authentication & authorization |
| [Zod](https://zod.dev/) | Schema validation |
| [Vercel](https://vercel.com/) | Deployment & hosting |

---

## 🔗 Live Links

| Service | URL |
|---|---|
| ⚙️ Backend API | [dreams-tour-management-system-backe.vercel.app](https://dreams-tour-management-system-backe.vercel.app) |
| 🌐 Frontend | [tour-management-jet.vercel.app](https://tour-management-jet.vercel.app) |

---

## 📂 Project Structure

```
togo-backend/
├── src/
│   ├── app/
│   │   ├── modules/            # Feature-based modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   └── auth.interface.ts
│   │   │   ├── user/
│   │   │   ├── tour/
│   │   │   └── booking/
│   │   ├── middlewares/        # Auth, error handler, validators
│   │   ├── config/             # Env, DB, Redis configuration
│   │   ├── errors/             # Custom error classes
│   │   ├── utils/              # Helper functions
│   │   └── routes/             # Central route registry
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Entry point
├── .env                        # Environment variables (not committed)
├── tsconfig.json
├── package.json
└── vercel.json
```

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js `v18.17` or later
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Redis (local or [Upstash](https://upstash.com/) / [Redis Cloud](https://redis.com/try-free/))
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/togo-backend.git
   cd togo-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000

   # Database
   DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/togo

   # Redis
   REDIS_URL=redis://localhost:6379

   # Auth
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # CORS
   CLIENT_URL=https://tour-management-jet.vercel.app
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. API will be running at [http://localhost:5000](http://localhost:5000) 🎉

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Run the compiled production build |
| `npm run lint` | Run ESLint checks |

---

## 🌱 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `DATABASE_URL` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry duration |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry duration |
| `CLIENT_URL` | Allowed frontend origin for CORS |

---

## 📡 API Overview

Base URL: `https://dreams-tour-management-system-backe.vercel.app/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login & receive tokens |
| `POST` | `/auth/refresh-token` | Refresh access token |
| `GET` | `/tours` | Get all tours |
| `GET` | `/tours/:id` | Get single tour details |
| `POST` | `/tours` | Create a new tour *(admin)* |
| `PATCH` | `/tours/:id` | Update a tour *(admin)* |
| `DELETE` | `/tours/:id` | Delete a tour *(admin)* |
| `POST` | `/bookings` | Create a booking |
| `GET` | `/bookings/my-bookings` | Get logged-in user's bookings |

> 📌 Update this table to match your actual route names and modules.

---

## 🧠 Architecture Notes

- **Layered structure**: routes → controllers → services → models, for clear separation of concerns
- **Mongoose schemas** define data models with validation at the database layer
- **Redis** is used to cache frequently requested tour listings and manage rate-limiting/session data
- **Centralized error handler** middleware ensures consistent JSON error responses across the API

---

## 🗺️ Roadmap

- [ ] Payment gateway integration
- [ ] Rate limiting with Redis
- [ ] Email notifications (booking confirmations)
- [ ] Admin analytics dashboard endpoints
- [ ] API documentation with Swagger/OpenAPI

---

## 🤝 Contributing

Contributions are what make the open-source community amazing. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

**Project Maintainer** — Asraful

API Link: [https://dreams-tour-management-system-backe.vercel.app](https://dreams-tour-management-system-backe.vercel.app)

---

<div align="center">

Made with ❤️ using Node.js, Express, TypeScript, MongoDB & Redis

</div>
