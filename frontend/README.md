# InvoiceMate ERP — Frontend

A modern enterprise resource planning frontend built with **Next.js 16**, **React 19**, **TypeScript**, **Zustand**, and **Tailwind CSS 4**.

---

## Quick Start

```bash
cd frontend
cp .env.example .env.local    # edit if backend is not on localhost:5000
npm install
npm run dev                    # http://localhost:3000
```

> The backend must be running for API calls to work. See [backend setup](#backend-setup) below.

---

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Email + password login |
| `/register` | Public | New user registration |
| `/invite/[token]` | Public | Accept workspace invite |
| `/dashboard` | Auth | KPI cards, department overview, activity feed |
| `/reports` | Auth | Analytics charts (donut, bar, overdue breakdown) |
| `/dept/[slug]` | Auth | Kanban board + List view for a department |
| `/dept/[slug]/members` | Auth | Add/remove department members |
| `/settings/profile` | Auth | Edit name, change password |
| `/settings/invites` | Admin | Create and manage invite links |
| `/settings/org` | Admin | Organization info, departments, role reference |

---

## Project Structure

```
src/
  app/                        # Next.js App Router
    (auth)/                   # Public auth pages (no sidebar)
      login/
      register/
      invite/[token]/
    (dashboard)/              # Protected pages (sidebar + topbar)
      dashboard/
      dept/[slug]/
      dept/[slug]/members/
      reports/
      settings/
        profile/
        invites/
        org/
      error.tsx               # Dashboard error boundary
  components/
    board/                    # KanbanBoard, ListView, BoardStatsBar, BoardConfigPanel
    card/                     # CardDetailDrawer (with audit log timeline)
    dept/                     # AddDeptModal
    layout/                   # Sidebar, Topbar, NotificationBell, NotificationPanel
    ui/                       # Avatar, Badge, Button, Card, CommandPalette, Input, Modal, SectionLabel, Toast
  hooks/
    useAuth.ts                # Auth guard + redirect
    usePermissions.ts         # Board-level RBAC (viewer/commenter/editor/owner)
  lib/
    api.ts                    # REST API client (38+ endpoints via fetch)
    utils.ts                  # cn(), PRIORITY_CONFIG
  store/
    auth.store.ts             # Login, register, token persistence
    board.store.ts            # Board + card CRUD, drag-drop
    dashboard.store.ts        # Analytics overview, dept stats, activity
    dept.store.ts             # Department CRUD, members
    notification.store.ts     # Socket.io + polling notifications
  types/
    index.ts                  # All TypeScript interfaces
```

---

## Key Features

### Core ERP
- **Kanban Board** — drag-and-drop cards between columns (@dnd-kit)
- **List/Table View** — collapsible column groups, sortable
- **Card Management** — title, description, priority, assignees, due dates, labels, custom fields
- **Comments** — inline code formatting, Ctrl+Enter to submit
- **File Attachments** — upload, preview images, download
- **Approval Workflow** — pending/approved/rejected status per card
- **Departments** — create with icon + color, manage members and boards
- **Board Configuration** — columns, custom fields, lock, compliance mode

### Analytics & Reporting
- **Dashboard** — KPI cards, department progress, global activity feed
- **Reports Page** — SVG donut chart (tasks by status), horizontal bar chart (by department), overdue breakdown, department health scores
- All charts use **real API data** from `/api/analytics/*`

### Role-Based Access Control
- **Organization roles**: super_admin, org_admin, top_management, user
- **Board roles**: board_owner, editor, commenter, viewer
- UI enforces restrictions: disabled drag-drop, hidden buttons, read-only drawers, "no permission" messages

### Real-Time
- **Socket.io** notifications with JWT auth
- Fallback polling every 30s if socket fails
- Bell icon with unread count badge

### Settings
- **Profile** — edit display name, change password
- **Invites** — create invite links with org role + department assignments
- **Organization** — department overview, role reference (admin only)

### UX
- **Command Palette** (Cmd+K) — search cards/boards/depts, quick actions (New Card, New Board, Invite)
- **Dark Mode** — system preference + manual toggle, persisted
- **Error Boundaries** — error.tsx for auth and dashboard route groups
- **Toast Notifications** — auto-dismiss API error alerts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand 5 (with persist middleware) |
| Drag & Drop | @dnd-kit (core + sortable) |
| Icons | Lucide React |
| Dates | date-fns |
| Realtime | socket.io-client |
| Theme | next-themes |
| Types | TypeScript 5 (strict mode) |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:5000` | Backend API base URL |

Copy `.env.example` to `.env.local` and edit as needed.

---

## Backend Setup

The backend lives in the `/backend` directory at the repo root.

```bash
cd backend
cp .env.example .env          # fill in MONGO_URI and JWT_SECRET
npm install
node server.js                # http://localhost:5000
```

Backend requires **MongoDB** running locally (default: `mongodb://localhost:27017/invoicemate-erp`).

---

## API Endpoints Used

The frontend calls these backend API groups:

| Group | Endpoints | Used For |
|---|---|---|
| Auth | `POST /api/auth/login`, `/register`, `GET /me` | Login, register, session |
| Departments | `GET/POST/PATCH/DELETE /api/departments/*` | CRUD, members |
| Boards | `GET/POST/PATCH/DELETE /api/boards/*` | CRUD, columns, fields |
| Cards | `GET/POST/PATCH/DELETE /api/cards/*` | CRUD, move, comments, attachments, approve/reject |
| Users | `GET /api/users?search=` | Member search |
| Analytics | `GET /api/analytics/overview`, `/departments`, `/activity` | Dashboard + Reports |
| Notifications | `GET/PATCH /api/notifications/*` | Bell, read/unread |
| Invites | `POST/GET/DELETE /api/invites/*`, `/validate`, `/accept` | Invite flow |

---

## Scripts

```bash
npm run dev       # Start development server (Turbopack)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```
