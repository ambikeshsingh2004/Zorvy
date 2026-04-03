# ZorvFinance — Finance Dashboard

A full-stack finance dashboard with role-based access control, built with **React + Express.js + PostgreSQL (Supabase)**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Joi |

---

## Project Structure

```
zorv/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth + RBAC + Error handler
│   │   ├── routes/          # Express routers
│   │   └── index.js         # App entry point
│   ├── schema.sql           # Database schema
│   └── .env                 # Environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── views/           # Page components
│   │   └── components/      # Shared components
└── package.json             # Root scripts
```

---

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd zorv
npm run install:all
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
JWT_SECRET=your_long_random_secret_here
```

### 3. Initialize the Database

Run `backend/schema.sql` in your Supabase SQL Editor to create all tables, types, and triggers.

### 4. Seed Default Admin

Start the backend, then call:

```bash
curl -X POST http://localhost:5000/api/auth/setup-admin
```

Default credentials:
- **Email:** `admin@dashboard.local`
- **Password:** `admin123`

### 5. Run Locally

**Terminal 1 — Backend:**
```bash
npm run start:backend
```

**Terminal 2 — Frontend:**
```bash
npm run start:frontend
```

Open `http://localhost:3000`

---

## API Reference

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login and receive JWT |
| POST | `/api/auth/register` | Public | Register as Viewer |
| POST | `/api/auth/setup-admin` | Public (once) | Seed default admin |

### Records

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/records` | All roles | List records (Viewer: own only) |
| POST | `/api/records` | Viewer, Admin | Create a record |
| PUT | `/api/records/:id` | Viewer (own), Admin | Update a record |
| DELETE | `/api/records/:id` | Viewer (own), Admin | Soft delete a record |

**Query params for GET `/api/records`:**
- `page`, `limit` — pagination
- `type` — `income` or `expense`
- `category` — filter by category
- `startDate`, `endDate` — date range (YYYY-MM-DD)
- `search` — search in category or notes

### Analytics

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/analytics/summary` | All roles | Income, expense, net balance |
| GET | `/api/dashboard/analytics/categories` | All roles | Breakdown by category |
| GET | `/api/dashboard/analytics/trends` | All roles | Monthly income vs expense |
| GET | `/api/dashboard/analytics/recent` | All roles | Last 5 records |

### Users (Admin only)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| PATCH | `/api/users/:id/role` | Admin | Update user role |
| POST | `/api/users/request-role` | Authenticated | Request a role upgrade |

---

## Roles & Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View own records | ✅ | ✅ | ✅ |
| View all records | ❌ | ✅ | ✅ |
| Create records | ✅ (own) | ❌ | ✅ |
| Update records | ✅ (own) | ❌ | ✅ |
| Delete records | ✅ (own, soft) | ❌ | ✅ |
| View analytics | ✅ (own data) | ✅ (all data) | ✅ (all data) |
| Manage users | ❌ | ❌ | ✅ |

---

## Key Design Decisions

- **Soft Delete:** Records are never hard-deleted. `deleted_at` is set instead and all queries filter `deleted_at IS NULL`.
- **Role Requests:** Users can request an Analyst upgrade. Admins see pending requests and approve/revoke via the User Management panel.
- **Single Deployment:** Express serves the compiled React bundle in production. Run `npm run deploy` to build and start.
- **Composite Indexes:** `(user_id, date)` index on records for efficient per-user date-sorted queries.

---

## Assumptions

- All monetary amounts are stored in USD as DECIMAL(12,2).
- New users always join as VIEWER and must request role upgrades.
- The `setup-admin` endpoint is a one-time seed and returns an error if an admin already exists.
- Soft-deleted records are excluded from all queries and analytics.
