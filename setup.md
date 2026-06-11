# Project Setup & Database Initialization

This file describes precise setup steps for developers and for automated agents to scaffold the Twin Lakes Lodge Management backend and database. It assumes a Windows developer environment (MySQL available, Node.js installed).

## Project Structure (scaffold)
- backend/
  - package.json
  - .env.example
  - src/
    - index.js
    - app.js
    - config/
    - routes/
    - routes/
    - controllers/
    - services/
  - prisma/
    - schema.prisma
  - sql/
    - init.sql
    - seed.sql
- frontend/ (create but do not implement pages for now)
  - README.md

## Environment variables (.env)
- `DATABASE_URL` - MySQL connection string, e.g. `mysql://user:pass@localhost:3306/twin_lakes`
- `JWT_SECRET` - long random secret for JWT signing
- `PORT` - server port (default 4000)
- Copy `backend/.env.example` to `backend/.env` before running Prisma or the server.

## Commands (developer)
1. Install dependencies (backend):
```bash
cd backend
npm install
```
2. Create the database (MySQL) and run schema SQL manually or via migration tool.

## SQL Initialization (manual)
Use the `init.sql` script in `backend/sql/init.sql` to create the `twin_lakes` database and all required tables. Example MySQL session:

```sql
CREATE DATABASE IF NOT EXISTS twin_lakes;
USE twin_lakes;
-- then run the table creation statements in init.sql
```

After the schema is in place, run `backend/sql/seed.sql` to load the initial rooms, staff roles, activities, and a reference exchange rate.

## Prisma
- Configure `DATABASE_URL` in `.env`.
- Run `npx prisma generate` then `npx prisma migrate dev --name init` to create migration and generate client.
- Do not run `npx prisma migrate` alone; it only prints help output. The correct development command is `npx prisma migrate dev`.
- If you already created `twin_lakes` manually, run the SQL in `backend/sql/init.sql` to create the tables before seeding or building APIs.
- To seed the database on this machine, run `cd backend` then `npm run db:seed` or `npx prisma db seed` after setting `DATABASE_URL`.

## Security Layer
- All protected backend routes now require a JWT access token in the `Authorization: Bearer <token>` header.
- RBAC is enforced at the route layer using the user role embedded in the token.
- Login and seed operations will return a controlled `503` if `DATABASE_URL` points to a MySQL account that the server cannot authenticate.
- If that happens, update `backend/.env` with valid MySQL credentials for this machine before retrying `npm run db:seed` or `npm start`.

## Notes
- The user requested: "dont work on the pages for now" — `frontend/` will be created as a placeholder only.
- Keep finance operations fully auditable: every payment or folio mutation should persist an `audit_logs` entry.
- The database target is MySQL and the schema should remain MySQL-compatible.
