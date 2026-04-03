# Zorv Analytics & Finance Dashboard

A comprehensive, role-based financial record and analytics dashboard built with a robust, separated Backend architecture and a dynamic React frontend.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):**
    *   **ADMIN:** Full management of users and global financial records.
    *   **ANALYST:** System-wide read access for complex analytics and reporting.
    *   **VIEWER:** Can only view and manage their *own* restricted ledger.
*   **Financial Records Ledger:** Create, view, update, and sort financial transactions. Includes soft-delete implementation.
*   **Deep-Dive Analytics:** Perform global and user-specific aggregations (Net income, totals, category-wise breakdowns, and trend charts) heavily utilizing backend PostgreSQL functions.
*   **Pagination & Limits:** Implemented full cursor/offset pagination across both the REST API and the Frontend React UI.
*   **Security & Stability:**
    *   JWT-based session authentication.
    *   Payload validation utilizing `Joi` middleware.
    *   Express rate limiting (strict 50 requests/min per IP to prevent DOS).

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TailwindCSS, Recharts (for analytics visualization), Axios.
*   **Backend:** Node.js, Express.js.
*   **Database:** PostgreSQL (Hosted on Supabase) utilizing raw SQL for maximum performance.
*   **Architecture Pattern:** Strict separation of standard HTTP routing (Controllers) from massive SQL logic (Services).

## 📁 Architecture

The project strictly follows Separation of Concerns:
*   `routes/`: Define API endpoints and attach `requireRole` protection middleware.
*   `controllers/`: Handle HTTP req/res formatting and param extraction.
*   `services/`: Pure business logic and decoupled PostgreSQL execution.
*   `middleware/`: Standardized `auth.js` and `validate.js` configurations.

## 🔌 API Endpoints

### Authentication
*   `POST /api/auth/register` - Create a new user.
*   `POST /api/auth/login` - Authenticate and retrieve JWT token.
*   `GET /api/auth/me` - Sync user session/role state.

### Records Management
*   `GET /api/records` - Fetch user ledger (Paginated).
*   `POST /api/records` - Create an entry (Time defaults to Postgres `NOW()`).
*   `PUT /api/records/:id` - Update entry details.
*   `DELETE /api/records/:id` - Soft delete entry.

### Analytics (Protected via ANALYST/ADMIN Role)
*   `GET /api/user-analytics/analyze-all` - System-wide cross-user aggregated data.
*   `GET /api/user-analytics/analyze/:userId` - Deep dive into a specific user's ledger.
*   `GET /api/user-analytics/users` - Directory of users (Paginated).

## ⚡ Setup & Local Development

1. Clone the repository.
2. Ensure you have `Node.js` installed.
3. Configure your Supabase PostgreSQL Database.
4. Run `schema.sql` inside your Supabase SQL editor to scaffold the exact tables.
5. Create a `.env` in your root or `backend` folder containing:
   ```env
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_secure_random_string
   ```
6. From the `backend` directory, run `npm install` then `npm run dev`.
7. From the `frontend` directory, run `npm install` then `npm run dev`.

*Built for maximum efficiency, transparency, and security.*
