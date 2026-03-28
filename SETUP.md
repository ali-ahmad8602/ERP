# InvoiceMate ERP — Setup Guide

## Prerequisites

- Node.js 18+
- MongoDB running on `localhost:27017`

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env    # then edit JWT_SECRET for production
npm install
node seed.js            # seeds database with sample data
npm run dev             # starts on http://localhost:5000
```

The seed script creates:
- 8 users (login: `hamza@invoicemate.com` / `Password1!`)
- 5 departments, 6 boards, 28 cards, 10 activities, 10 notifications

### 2. Frontend

```bash
cd frontend
cp .env.example .env    # points to http://localhost:5000/api by default
npm install
npm run dev             # starts on http://localhost:5173
```

### 3. Open in Browser

Navigate to http://localhost:5173 — the app auto-logs in with the seed admin account.

Pages:
- `/dashboard` — KPI overview, activity feed, notifications, performance
- `/boards` — All boards grid (6 boards across 5 departments)
- `/boards/:id` — Kanban board with drag-and-drop cards
- `/analytics` — Charts, department breakdown, activity timeline
- `/notifications` — Full notification list with mark-as-read

## Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/invoicemate-erp` | MongoDB connection |
| `JWT_SECRET` | — | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL (for CORS) |

### Frontend (`frontend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

## Architecture

```
frontend/                    React + Vite + Tailwind + Zustand
  src/api/                   Axios client + API modules
  src/store/                 Zustand stores (analytics, boards, notifications)
  src/pages/                 Route pages
  src/components/            UI components
  src/data/                  Mock data (fallback when API unavailable)

backend/                     Express + MongoDB + Socket.io
  routes/                    REST API endpoints
  models/                    Mongoose schemas
  middleware/                Auth + RBAC middleware
  services/                  Notifications + scheduler
  seed.js                    Database seed script
```
