# InvoiceMate Workspace

A full-featured internal organization management platform with Kanban boards, approval workflows, real-time notifications, file attachments, custom fields, audit trails, and role-based access control.

**Stack:** React 19 + Vite + Tailwind CSS v4 + Framer Motion + Zustand | Express + MongoDB + Socket.io

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running on `localhost:27017`

### 1. Backend

```bash
cd backend
cp .env.example .env       # edit JWT_SECRET for production
npm install
node seed.js               # seeds database with sample data
npm run dev                # starts on http://localhost:5000
```

The seed script creates 8 users, 5 departments, 6 boards, 28 cards, 10 activities, 10 notifications.

**Default login:** `hamza@invoicemate.com` / `Password1!`

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # points to http://localhost:5000/api
npm install
npm run dev                # starts on http://localhost:5173
```

### 3. Open

Navigate to `http://localhost:5173` and log in.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/invoicemate-erp` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for signing JWT tokens (change in production) |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS + invite links |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## Features Implemented (24)

### Core Workflow
- **Login / Logout / Session** — JWT auth, session validation on reload, auto-redirect on expiry
- **Org Dashboard** — 5 live KPI cards (total, in-progress, overdue, approvals, compliance) with skeleton loaders
- **Analytics** — Department table with progress bars, status donut chart, bar chart, paginated activity feed
- **Board Grid** — All boards across departments with card counts, loading skeletons, create board modal

### Kanban & Cards
- **Kanban Board** — 5-column layout, drag-and-drop between columns (persisted to API with optimistic revert)
- **Card Creation** — Title, description, priority, custom field values, column targeting
- **Card Detail Drawer** — Full card view with metadata, due date alerts, attachments, comments, audit trail
- **Card Archive** — Soft delete with UI removal

### Approval Workflows
- **Approval System** — Per-board approval config, pending/approved/rejected states
- **Approval UI** — Status banner, progress bar, approver list, approve/reject buttons with rejection reason
- **Drag Guard** — Pending-approval cards cannot be moved until approved

### Custom Fields
- **Field Management** — Admin modal to create/delete 7 field types (text, number, date, dropdown, checkbox, URL, user)
- **Card Integration** — Custom fields in create form with validation, read-only display in detail drawer

### File Attachments
- **Upload** — Multipart with progress bar, client+server validation (10MB, MIME whitelist)
- **Preview** — Image thumbnails with fullscreen modal, type-aware file icons
- **Download / Delete** — Direct download, delete with audit trail

### Notifications
- **REST** — List, mark read, mark all read, filter tabs (all/unread)
- **WebSocket** — Real-time push via Socket.io, bell pulse animation, connection status indicator
- **Due Date Reminders** — Hourly scheduler, overdue/due-today/due-soon visual indicators

### Organization
- **Invite System** — Send invites (email + role + departments), copy link, revoke, validate + accept with registration
- **Audit Trail** — Card-level (9 action types, timeline) + org-level (12 types, paginated feed)
- **RBAC** — 3-tier permissions (org/department/board), 6 roles, frontend gating + backend enforcement

### UI/UX
- **Glassmorphic Theme** — "Luminous Obsidian" dark theme with blur, glow effects, Framer Motion animations
- **Loading States** — Skeleton loaders on every data page
- **Error Handling** — Banners on every page, form errors, optimistic updates with revert

---

## Role-Based Access

| Role | Boards | Cards | Approvals | Settings | Invites |
|---|---|---|---|---|---|
| Super Admin | Full access | Full access | Can approve | Full access | Can invite |
| Org Admin | Full access | Full access | Can approve | Full access | Can invite |
| Top Management | View all, cannot create | Edit/move/comment | If approver | No access | No access |
| Dept Head | Own department | Edit/move/comment | If approver | No access | No access |
| Member | Own department | Edit/move/comment | If approver | No access | No access |
| Guest | View only | View only | View only | No access | No access |

---

## Project Structure

```
backend/
  config/           Database + upload config
  middleware/        JWT auth + RBAC guards
  models/           Mongoose schemas (User, Board, Card, Department, Activity, Notification, Invite)
  routes/           REST API endpoints (auth, users, departments, boards, cards, analytics, notifications, invites, uploads)
  services/         Notification service + due-date scheduler
  seed.js           Database seed script
  server.js         Express + Socket.io entry point

frontend/
  src/
    api/            Axios client + API modules (auth, analytics, boards, notifications, invites)
    components/     UI components (boards, notifications, analytics, ui)
    hooks/          usePermissions (RBAC hook)
    lib/            Socket.io manager, date utilities
    pages/          Route pages (Login, Dashboard, Boards, BoardView, Analytics, Notifications, Invites, AcceptInvite)
    store/          Zustand stores (auth, analytics, boards, notifications)
```

---

## API Endpoints (34)

| Group | Endpoints |
|---|---|
| Auth | `POST /login`, `POST /register`, `GET /me` |
| Users | `GET /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/deactivate`, `PATCH /:id/activate` |
| Departments | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, `POST /:id/members`, `DELETE /:id/members/:userId` |
| Boards | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, columns CRUD, custom fields CRUD |
| Cards | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/move`, `POST /:id/comments`, `POST /:id/approve`, `POST /:id/reject`, `DELETE /:id` |
| Attachments | `POST /cards/:id/attachments`, `DELETE /cards/:id/attachments/:attId` |
| Analytics | `GET /overview`, `GET /departments`, `GET /activity` |
| Notifications | `GET /`, `PATCH /:id/read`, `PATCH /read-all` |
| Invites | `POST /`, `GET /`, `DELETE /:id`, `GET /validate/:token`, `POST /accept/:token` |

---

## Known Limitations

These features have backend support but no frontend UI yet:

- **Card inline edit** — `updateCard()` API exists, no edit mode in card drawer
- **Board settings panel** — No UI for approval toggles, board lock, or compliance tagging
- **Company boards** — Fetched but cannot be created from UI
- **Department management** — No CRUD page (backend ready)
- **User management** — No activate/deactivate page (backend ready)
- **Sidebar navigation** — Uses top bar only
- **List/table view** — Kanban only
- **Search** — No search UI (backend supports user search)
- **Self-registration** — Invite-only onboarding

---

## Seed Data Accounts

| Name | Email | Password | Role |
|---|---|---|---|
| Hamza Anjum | hamza@invoicemate.com | Password1! | super_admin |
| Sarah Chen | sarah@invoicemate.com | Password1! | org_admin |
| Marcus Webb | marcus@invoicemate.com | Password1! | top_management |
| Priya Patel | priya@invoicemate.com | Password1! | user (dept_head) |
| James Liu | james@invoicemate.com | Password1! | user (member) |
| Amina Okafor | amina@invoicemate.com | Password1! | user (dept_head) |
| Daniel Park | daniel@invoicemate.com | Password1! | user (member) |
| Riya Sharma | riya@invoicemate.com | Password1! | user (dept_head) |
