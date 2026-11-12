# Lodge Demo: Lodge Management System

> **Demo build (static):** this repo is a database-free, login-free demo. The frontend answers every `/api/*` call from an in-browser mock (`frontend/src/mock/` — seeded demo records, state in `sessionStorage`; the sidebar "Reset Demo Data" button restores the seed). There is no sign-in; visitors land on the dashboard as admin. The `backend/` folder is the original Express + Prisma API and is **not used** by the demo. Deploy: Vercel, root directory `frontend`, framework Vite.


A full-stack lodge management system for a sample lodge. Built with Node.js + Express + Prisma + MySQL (backend) and React + Vite + Tailwind CSS (frontend).

## Quick Start

```bash
# Terminal 1 — Backend (port 4000)
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET, SMTP_*
node prisma/seed.js         # initialize DB + seed data
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open: http://localhost:5173

## Project Structure

```
Twin lakes lodge mgt/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app factory + all route registrations
│   │   ├── config/
│   │   │   ├── prisma.js       # Prisma singleton
│   │   │   ├── mailer.js       # Nodemailer SMTP transporter (verify() at startup)
│   │   │   └── sms.js          # Africa's Talking SMS stub (invite channel)
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   ├── rbac.middleware.js    # Role-based access
│   │   │   └── error.middleware.js  # Global error handler
│   │   ├── routes/             # Express routers
│   │   └── services/
│   │       ├── audit.service.js     # writeAuditLog()
│   │       ├── folio.service.js     # calculateBalance(), convertCurrency()
│   │       └── room.service.js      # setRoomStatus()
│   ├── prisma/schema.prisma    # Complete Prisma schema (15 models)
│   └── sql/
│       ├── init.sql            # DDL — creates all tables
│       └── seed.sql            # Seed data — rooms, staff, activities
├── frontend/
│   └── src/
│       ├── App.jsx             # Router + all routes
│       ├── contexts/
│       │   └── AuthContext.jsx # Auth state + useCanWrite() hook
│       ├── layouts/
│       │   └── AppLayout.jsx   # Sidebar + topbar + hamburger menu
│       ├── components/         # Shared UI components
│       └── pages/              # One file per route
├── spec.md                     # Machine-readable feature specification
├── SRS.txt                     # Business requirements
└── setup.md                    # Developer setup guide
```

## Seed Credentials

All accounts use password: **`password123`**

| Email | Role |
|-------|------|
| admin@lodge.local | Admin (full access) |
| frontdesk@lodge.local | Front Desk |
| pos@lodge.local | Restaurant POS |
| guide@lodge.local | Activity Guide |
| housekeeping@lodge.local | Housekeeping |

## Environment Variables (backend/.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MySQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `PORT` | No | Server port (default: 4000) |
| `SMTP_HOST` | For email | `smtp.gmail.com` |
| `SMTP_PORT` | For email | `587` |
| `SMTP_USER` | For email | Gmail address |
| `SMTP_PASS` | For email | 16-char Google App Password |
| `SMTP_FROM` | For email | Display name (Gmail rewrites address to SMTP_USER) |
| `APP_URL` | For invites | `http://localhost:5173` |
| `AT_USERNAME` | For SMS | Africa's Talking username (stub until set) |
| `AT_API_KEY` | For SMS | Africa's Talking API key (stub until set) |
| `AT_SENDER` | For SMS | Sender ID / shortcode (optional) |

> **Gmail note:** App Passwords are shown with spaces — they're stripped automatically in `mailer.js`. The `From` address is always sent as the authenticated `SMTP_USER` (Gmail rejects mismatched senders). SMS runs in stub mode (logs the message) until `AT_*` keys are filled and the real send is uncommented in `src/config/sms.js`.

## API Endpoints

### Auth
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/refresh` — refreshes JWT (auth required)
- `GET /api/auth/verify-invite?token=` — validates invite token (public)
- `POST /api/auth/accept-invite` — creates user from invite (public)

### Users
- `GET /api/users/me` — current user profile
- `PUT /api/users/me` — update name/email
- `PUT /api/users/me/password` — change password
- `GET /api/users` — list all users (admin)
- `POST /api/users/invite` — send invite (admin); body `{ email, role, channel: 'email'|'sms'|'both', phone? }`
- `PUT /api/users/:id/role` — update user role (admin; role is otherwise fixed at invite time)
- `GET /api/users/audit-log` — paginated audit log with actor names (admin)

### Rooms — `GET /api/rooms`, `GET /api/rooms/available?from=&to=` (date-aware, excludes booked), `POST /api/rooms`, `GET /api/rooms/:id`, `PATCH /api/rooms/:id/status` (body `{ status }` for availability **and/or** `{ housekeepingStatus }` for cleanliness — two independent dimensions)

### Reservations — `GET`, `POST /api/reservations`, `GET /api/reservations/:id`, `POST .../checkin`, `POST .../checkout` (checkout sets room `available` + `dirty`)

### Folios — `GET /api/folios`, `GET /api/folios/:id`, `POST .../items`, `POST .../payments`, `PATCH /api/folios/:id/status` (mark paid/closed)

### Activities — `GET /api/activities`, `GET /api/activities/schedules?date=&status=`, `POST /api/activities`, `POST /api/activities/schedules` (body `{ activityId, scheduledAt, endAt, capacity, location }`), `PATCH /api/activities/schedules/:id/status` (not_started/in_progress/completed), `POST /api/activities/:id/book` — in-house `{ reservationId, paxCount }` charges the room folio; walk-in `{ guestName, paxCount, payment:{method,currency} }` collects payment now (activity has a per-person `price`)

### Housekeeping — `GET /api/housekeeping/tasks`, `POST .../tasks/:id/complete` (UI is room-centric, driven by `PATCH /rooms/:id/status` with `housekeepingStatus`)

### Notifications — `GET /api/notifications`, `GET /api/notifications/count` (per-user unread since `notificationsSeenAt`), `POST /api/notifications/seen` (mark read)

### Dashboard — `GET /api/dashboard/summary`

### POS — `GET /api/pos/menu`, `POST /api/pos/orders`

### Finance — `GET /api/finance/reconciliation/today` (expected totals + day's payments), `POST /api/finance/reconciliation` (save shift close with counted actuals)

### Reports — `GET /api/reports/summary?from=&to=` (revenue, occupancy/ADR/RevPAR, activities, outstanding folios + reconciliation history)

## Role Permission Matrix

| Role | Write Access On |
|------|----------------|
| admin | All pages and endpoints |
| frontdesk | Dashboard, Calendar, Rooms, Folios, POS, Activities, Finance, Reports |
| pos | Restaurant POS only |
| guide | Activities (can advance schedule status) |
| housekeeping | Rooms + Housekeeping (cleanliness) |
| viewer | All pages read-only — buttons/forms disabled |

## Key Architecture Decisions

- **Prisma over raw SQL**: controllers use `prisma.*` for type safety and relations
- **AuditLog as notifications**: no separate notifications table — `audit_logs` feeds both the activity log and notification drawer
- **JWT stateless auth**: no sessions, tokens expire in 8h, refresh endpoint extends
- **Tax calculation on folio retrieval**: Tourism Tax (5%) + VAT (18%) computed at read time, not stored
- **Invite tokens**: UUID stored in `user_invites` with 48h expiry, single-use, UPSERT on re-invite
- **useCanWrite() hook**: centralized permission check in `AuthContext.jsx` — path → allowed write roles map
- **Vite proxy**: `/api/*` proxied to `:4000` in dev — no CORS issues, mirrors production
- **VARCHAR status columns (not ENUM)**: Prisma 5.x errors on MySQL ENUM→String; all status/role/type columns are `VARCHAR`.
- **Dual room status**: `rooms.status` = availability (`available`/`occupied`); `rooms.housekeepingStatus` = cleanliness (`dirty`/`cleaning`/`clean`). Independent — a room can be `available` + `dirty`. Rooms page edits both; Housekeeping edits cleanliness only. `inspected` was removed.
- **Activity pricing & payment**: each `Activity` has a per-person `price`. Booking an in-house guest adds an `activity` FolioItem (pay at checkout); a walk-in records an immediate `Payment` (folioId null). Schedules carry `endAt`, per-slot `capacity`, and a `status` (not_started/in_progress/completed).
- **Per-user notifications**: `users.notificationsSeenAt` tracks last view; the bell badge counts audit_logs after that timestamp and clears via `POST /notifications/seen` when the drawer opens.
- **Shift reconciliation**: `shift_reconciliations` stores expected (computed from the day's payments, bucketed cash/mobile/card) vs counted actuals; the Finance "Finalize" persists a row + audit log.
- **Room-centric housekeeping**: the Housekeeping page lists every room and drives status via `PATCH /rooms/:id/status` (no per-task workflow in the UI)
- **Date-aware availability**: New Booking calls `GET /rooms/available?from=&to=`, which excludes rooms with an overlapping `pending`/`confirmed`/`checked_in` reservation — prevents double-booking
- **Walk-in activity bookings**: `ActivityBooking.reservationId` is nullable; walk-ins store a `guestName` instead of a reservation FK
- **Check-in/out via folio**: folio↔reservation is 1:1, so check-in/out + mark-paid live on the Folios row Edit modal (`FolioQuickActions.jsx`) and the folio detail header — no separate Guests page

## Frontend Pages

| Route | Component | Access |
|-------|-----------|--------|
| `/login` | Login.jsx | Public |
| `/accept-invite` | AcceptInvite.jsx | Public |
| `/dashboard` | Dashboard.jsx | All roles |
| `/rooms` | Rooms.jsx | admin, frontdesk, housekeeping |
| `/calendar` | Calendar.jsx | All roles |
| `/folios` | FoliosList.jsx | All roles (Edit modal: admin, frontdesk) |
| `/folios/:id` | Folio.jsx | All roles |
| `/pos` | POS.jsx | admin, frontdesk, pos, viewer |
| `/activities` | Activities.jsx | admin, frontdesk, guide, viewer |
| `/housekeeping` | Housekeeping.jsx | admin, housekeeping, viewer |
| `/finance` | Finance.jsx | admin, frontdesk, viewer |
| `/reports` | Reports.jsx | admin, frontdesk, viewer |
| `/users` | Users.jsx | admin only |
| `/settings` | Settings.jsx | All roles |
