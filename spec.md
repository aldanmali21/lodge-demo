# Twin Lakes Safari Lodge Management - AI Specification

## Overview
This document is a machine-friendly, detailed specification derived from the provided SRS. It describes actors, data model, API contracts, workflows, RBAC, auditing, currency handling, indices, and recommended implementation details (Node.js + Express + Prisma + MySQL). Use this as a canonical source for automated scaffolding, tests, and further code generation.

## Goals
- Replace manual processes with a single system managing reservations, POS, activities, housekeeping, and manual finance.
- Enforce RBAC and audit trails for financial operations.
- Support multi-currency (UGX, USD) with an admin-set exchange rate.
- Keep external payment gateway integration out of scope for this phase.

## Actors / Roles
- Administrator: full access; manage staff, rates, view analytics, audit logs.
- Front Desk (Reception): manage reservations, check-in/out, folios, manual payments.
- Restaurant/Bar POS: create orders, route charges to folios.
- Activity Guide: view assigned manifests, mark attendance.
- Housekeeping: mobile view to update room status.

## Key Entities (conceptual)
- User (staff) — role, credentials, meta.
- Room — room number, type, rate, status.
- Reservation — guest info, dates, assigned rooms, status.
- Folio — master invoice per reservation, with line items.
- FolioItem — individual charges (room nights, menu items, activities).
- Payment — manual payment entries linked to a folio or shift.
- Activity & ActivitySchedule — predefined experiences with capacity.
- ActivityBooking — guest allocations to scheduled activities.
- Order & OrderItem — POS orders; optionally routed to folio.
- HousekeepingTask — room tasks and statuses.
- AuditLog — immutable record of important actions.

## Data Model (relational mapping)
- users
  - id INT PK
  - name VARCHAR
  - email UNIQUE
  - password_hash VARCHAR
  - role ENUM('admin','frontdesk','pos','guide','housekeeping')
  - created_at DATETIME

- rooms
  - id INT PK
  - number VARCHAR UNIQUE
  - type VARCHAR
  - capacity INT
  - default_rate DECIMAL(12,2) -- base rate stored in USD or UGX depending on admin settings
  - status ENUM('available','occupied','dirty','clean','inspected')

- reservations
  - id INT PK
  - guest_name VARCHAR
  - guest_contact VARCHAR
  - status ENUM('pending','confirmed','checked_in','checked_out','cancelled')
  - checkin_date DATE
  - checkout_date DATE
  - created_by INT FK -> users(id)
  - created_at DATETIME

- reservation_rooms (many-to-many)
  - id INT PK
  - reservation_id FK
  - room_id FK

- folios
  - id INT PK
  - reservation_id FK
  - total_amount DECIMAL(14,2)
  - currency CHAR(3) -- 'USD' or 'UGX'
  - status ENUM('open','paid','closed')

- folio_items
  - id INT PK
  - folio_id FK
  - description TEXT
  - amount DECIMAL(12,2)
  - currency CHAR(3)
  - type ENUM('room','pos','activity','other')
  - created_at DATETIME

- payments
  - id INT PK
  - folio_id FK NULLABLE
  - amount DECIMAL(14,2)
  - currency CHAR(3)
  - method VARCHAR(32) -- 'Cash','Airtel','CardTerminal', etc.
  - reference VARCHAR(128)
  - received_by INT FK -> users(id)
  - timestamp DATETIME

- activities
  - id INT PK
  - name VARCHAR
  - description TEXT
  - max_capacity INT

- activity_schedules
  - id INT PK
  - activity_id FK
  - scheduled_at DATETIME
  - location VARCHAR

- activity_bookings
  - id INT PK
  - schedule_id FK
  - reservation_id FK
  - pax_count INT

- menu_items, orders, order_items

- housekeeping_tasks
  - id, room_id, status, assigned_to, notes, timestamp

- audit_logs
  - id INT PK
  - actor_id FK
  - action VARCHAR
  - object_type VARCHAR
  - object_id INT
  - details JSON
  - created_at DATETIME

## Indexing & Performance
- Index reservations by checkin_date, checkout_date, status.
- Index folio_items and payments by folio_id.
- Add composite index on activity_schedules(scheduled_at, activity_id).

## API Contracts (REST - suggested routes)
- Auth
  - POST /api/auth/login {email,password} -> {token, user}
  - POST /api/auth/refresh -> {token}

- Users (admin)
  - GET /api/users
  - POST /api/users

- Rooms
  - GET /api/rooms
  - POST /api/rooms

- Reservations
  - POST /api/reservations -> create reservation + preliminary folio
  - GET /api/reservations?from=&to=&status=
  - GET /api/reservations/:id
  - POST /api/reservations/:id/checkin -> mark checked_in and set room status
  - POST /api/reservations/:id/checkout -> generate folio, mark dirty

- Folios
  - GET /api/folios/:id
  - POST /api/folios/:id/items -> add folio item
  - POST /api/folios/:id/payments -> record manual payment

- Activities
  - CRUD activities and schedules
  - POST /api/schedules/:id/book -> add booking (prevent overbooking)

- POS
  - POST /api/orders -> create order (optional folio_id to route)

- Housekeeping
  - GET /api/housekeeping/tasks
  - POST /api/housekeeping/tasks/:id/complete

Security: All API endpoints require JWT with role-based middleware.

## Workflows (detailed)
- Reservation & Check-In
 1. Create reservation (status=confirmed or pending). System reserves room(s).
 2. On check-in, endpoint verifies booking dates; creates/activates folio; sets room status to 'occupied'; logs audit.

- In-Stay Charges
 1. POS creates an order. If 'chargeToRoom' set, server creates a `folio_item` linking to reservation's folio.
 2. Activity bookings added to folio similarly.

- Checkout & Manual Payment
 1. On checkout, server compiles folio total (sum of folio_items). A cashier reviews.
 2. Staff records payment via POST /api/folios/:id/payments with method/currency/reference.
 3. System marks folio 'paid' if paid in full; room status -> 'dirty'; writes audit log.

## Currency & Exchange Rate Handling
- Store `amount` values with currency code per row. Avoid implicit conversions.
- Provide `exchange_rates` table with `base_currency`, `target_currency`, `rate`, `effective_date`.
- On reporting, convert using active rate snapshot; store converted_amount for financial audits if needed.

## Auditing
- Every mutation affecting finances, reservations, or folios must create an `audit_logs` entry with actor, action, and delta.

## Suggested Implementation Notes
- Use Prisma as ORM to enforce relations and generate types.
- Secure password storage with bcrypt; JWT tokens signed with a `JWT_SECRET`.
- Validate and sanitize all inputs at controller layer.
- Keep POS and Housekeeping UI separate; backend routes reuse same models and RBAC.

## Minimal Acceptance Criteria for Phase 1
- Create/modify reservations and rooms.
- Check-in/out flow updates folios and room status.
- Record manual payments and audit them.
- POS can add charges to folios.

---
Generated for machine consumption and scaffolding. For further automation, use the `prisma/schema.prisma` definitions in the `prisma/` folder.

---

## Phase 2 Additions

### Updated Roles
- Administrator, Front Desk, Restaurant POS, Activity Guide, Housekeeping (unchanged)
- **Viewer** (new): Read-only access to all pages. Can see all data but cannot perform write operations. Buttons/forms are disabled with "View-only access" tooltip.

### Role Permission Matrix
| Role         | Dashboard | Calendar | Folios | POS | Activities | Housekeeping | Finance | Users |
|--------------|-----------|----------|--------|-----|------------|--------------|---------|-------|
| admin        | R/W       | R/W      | R/W    | R/W | R/W        | R/W          | R/W     | R/W   |
| frontdesk    | R/W       | R/W      | R/W    | R/W | R/W        | –            | R/W     | –     |
| pos          | R         | R        | R      | R/W | R          | –            | –       | –     |
| guide        | R         | R        | R      | –   | R          | –            | –       | –     |
| housekeeping | R         | R        | R      | –   | –          | R/W          | –       | –     |
| viewer       | R         | R        | R      | R   | R          | R            | R       | –     |

### User Invite System
- Admin sends invite via `POST /api/users/invite` with `{ email, role }`
- Backend generates a UUID token, stores in `user_invites` table with 48h expiry
- Email sent via Nodemailer (Gmail SMTP) with branded HTML template and CTA link
- Invite URL: `{APP_URL}/accept-invite?token={token}`
- Recipient visits URL → `GET /api/auth/verify-invite?token=` validates token → shows form
- User fills: First Name, Last Name, Password, Confirm Password (initials avatar, no file upload)
- Submit → `POST /api/auth/accept-invite` → creates User, marks invite used, auto-returns JWT
- User is immediately logged in and redirected to dashboard

### UserInvite Data Model
- `user_invites` table: id, email (UNIQUE), role, token (UNIQUE), expires_at, used_at, created_at, created_by→users(id)
- Tokens expire after 48 hours; used tokens cannot be reused (HTTP 410)
- Re-inviting same email UPSERTs (overwrites old token with new one)

### Users Management Page (`/users`) — admin only
- Tab 1 — Team Members: table of all staff with role dropdown (inline role change), invite button
- Tab 2 — Activity Log: paginated audit_log table with actor, action, object, timestamp; date/actor/action filters; CSV export
- Activity Log is read-only; sourced from `audit_logs` table joined with `users`

### Notifications
- Source: `audit_logs` table (no separate notifications table)
- `GET /api/notifications` — last 20 events, ordered DESC, with actor name
- `GET /api/notifications/count` — count of events in last 24h (badge number)
- Frontend: slide-in drawer from right, icons per action type, relative timestamps

### Settings Page (`/settings`)
- Profile tab: edit name + email via `PUT /api/users/me`; role is read-only
- Security tab: change password via `PUT /api/users/me/password` (requires current password verification)

### SMTP Configuration (Gmail)
- Requires Gmail account with 2-Step Verification enabled
- Generate App Password: Google Account → Security → 2-Step Verification → App passwords
- Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS` in `.env`
- If SMTP fails, invite URL is returned in API response for manual sharing (dev fallback)

---

## Phase 3 Additions

### Email Delivery Fixes (Gmail)
- App Password whitespace is stripped in `mailer.js` (Gmail rejects spaced passwords with 535).
- `From` is always the authenticated `SMTP_USER` with a "Twin Lakes Lodge" display name (Gmail rejects mismatched senders).
- `transporter.verify()` runs at startup → logs `✓ SMTP ready` or `✗ SMTP error`.
- Invite modal surfaces the real `emailError` to admins when send fails.

### SMS Invite Channel (Africa's Talking — stubbed)
- `POST /api/users/invite` accepts `channel` (`email` | `sms` | `both`) and optional `phone`.
- `src/config/sms.js` exposes `sendInviteSms()`; runs in stub mode (logs message) until `AT_USERNAME`/`AT_API_KEY` are set and the real SDK block is uncommented.
- Same invite token/URL is delivered regardless of channel. Phone is transient (not stored).
- Invite modal has an Email/SMS/Both toggle + conditional phone field.

### Role Is Fixed at Invite Time
- The Team table shows a **static role badge** (no inline dropdown). Role is assigned only when inviting. `PUT /api/users/:id/role` still exists but is not exposed in the table UI.

### Date-Aware Room Availability (anti double-booking)
- `GET /api/rooms/available?from=&to=` returns rooms with **no overlapping** `pending`/`confirmed`/`checked_in` reservation (overlap rule: `checkinDate < to AND checkoutDate > from`).
- New Booking modal fetches this when dates are chosen, and includes a room search bar (number/type).

### Manual Check-In / Check-Out + Folio Status
- Check-in/out is reached from the Folios list **Edit** modal (`FolioQuickActions`) and the folio detail header (folio↔reservation is 1:1; no separate Guests page).
- `PATCH /api/folios/:id/status` manually sets `open`/`paid`/`closed` ("Mark as Paid"); writes an audit log.
- `listFolios`/`getFolio` include `reservation.reservationRooms.room` so the ROOM(S) column renders.
- Folio detail page has a **Back to Folios** button.

### Room-Centric Housekeeping
- Housekeeping lists **every room** (ALL filter = whole inventory), each with a status dropdown: Dirty / In Progress (`cleaning`) / Clean / Inspected → `PATCH /rooms/:id/status`.
- Includes a room search bar. The old "Mark Dirty" button + task-creation flow are removed from the UI.
- Enabled by VARCHAR status columns (Prisma 5.x cannot map MySQL ENUM → String).

### Activity Guest Booking (in-house + walk-in)
- Each schedule card shows its **date** and a **Book Guest** action.
- `BookGuestModal` books an in-house guest (`reservationId`) chosen from current confirmed/checked-in reservations, **or** a walk-in (`guestName`), with a pax count validated against remaining capacity.
- `ActivityBooking.reservationId` is now nullable; walk-ins store `guest_name`. `listSchedules` returns a `guestLabel` per booking. Expanded card shows the manifest or "No guests booked yet."

### UI/Navigation
- Removed the `SHIFT: OPEN` header badge.
- Sidebar order: Dashboard → **Rooms** → Calendar → Folios → … (Rooms moved above Calendar).
- Activity Log shows the staff member's name (avatar + name) for every event.

---

## Phase 4 Additions

### Dual Room Status (availability + cleanliness)
- `rooms.status` = availability: `available` | `occupied`. `rooms.housekeeping_status` = cleanliness: `dirty` | `cleaning` | `clean`. Independent dimensions — a room can be `available` AND `dirty`.
- **`inspected` removed** everywhere.
- `PATCH /rooms/:id/status` accepts `{ status }` and/or `{ housekeepingStatus }`, validated against their own value sets.
- Check-out sets the room `available` + `dirty` simultaneously.
- Rooms page: stats = Total / Available / Occupied; each card has two dropdowns (availability + cleanliness). Housekeeping page: cleanliness only (Dirty/In Progress/Clean) with search + filters. Dashboard room grid: tile colour = availability, corner dot = cleanliness.

### Activity Pricing, Scheduling & Payment
- `activities.price` = per-person price (seeded: Boat 85, Game Drive 120, Nature Walk 40, Birding 35, Cultural 30).
- `activity_schedules` gains `end_at` (To), `capacity` (per-slot override of activity max), and `status` (`not_started`|`in_progress`|`completed`).
- ScheduleModal: From (date+time), To (date+time), Capacity, Location. Board cards show From→To, effective capacity, and a status dropdown; page has status filter chips + date navigator.
- Booking payment: in-house guest → activity charge added to their room folio; walk-in → immediate `Payment` (method + currency chosen in modal). `POST /activities/schedules/:id/status` advances slot status.

### Per-User Notifications
- `users.notifications_seen_at` tracks each user's last view. `GET /notifications/count` counts audit_logs after that timestamp; `POST /notifications/seen` sets it to now (called when the drawer opens), clearing the badge for that account only.

### Finance Ledger & Shift Reconciliation
- Transactions table shows a **date** (+ time) and pulls all of the day's payments (including walk-in activity payments with no folio).
- `shift_reconciliations` table stores expected (auto-computed from the day's payments, bucketed into cash / mobile / card) vs counted actual amounts. `GET /finance/reconciliation/today` returns expected + payments + any existing close; `POST /finance/reconciliation` saves the close (audit-logged). The Finance panel has actual-amount inputs, live variance, and a working Finalize button.

### Reports Page (`/reports`, admin/frontdesk/viewer)
- `GET /reports/summary?from=&to=` aggregates four sections, each CSV-exportable:
  - **Revenue & Payments**: total, by method (cash/mobile/card), by currency, by day.
  - **Occupancy & Rooms**: occupancy % (room-nights sold ÷ available), ADR, RevPAR, nights by room type.
  - **Activities**: bookings/pax/revenue per activity, walk-in vs in-house split.
  - **Outstanding Folios & Reconciliation**: open folio balances + recent shift-close variances.

### Folio Detail
- The "Record Manual Payment" form was removed from the folio detail page. Payments are recorded via the Folios-list **Edit** modal and the activity walk-in flow; the detail page keeps check-in/out + mark-paid header actions and the Back button.
