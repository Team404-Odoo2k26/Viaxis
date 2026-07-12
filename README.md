# TransitOps — Smart Transport Operations Platform

> Built for **Odoo Yearly Hackathon 2026** · Team **Team404**

TransitOps is a centralized platform that digitizes the complete lifecycle of transport operations — from vehicle registration and driver management to dispatching, maintenance, fuel logging, and real-time analytics.

## The Problem

Most logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This leads to:

- Scheduling conflicts and double-bookings
- Underutilized vehicles sitting idle
- Missed maintenance windows and unexpected breakdowns
- Expired driver licenses going unnoticed
- Inaccurate expense tracking
- Zero operational visibility for decision-makers

## Our Solution

**TransitOps** provides a single source of truth for your entire fleet, with automated business rule enforcement, real-time KPI dashboards, and role-based access so every team member sees exactly what they need.

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | Next.js 15 · React 19 · Tailwind CSS v4         |
| Backend    | Node.js · Express.js · Prisma ORM               |
| Database   | PostgreSQL                                      |
| Auth       | JWT · Role-Based Access Control (RBAC)          |

## Quick Setup

Install all dependencies for both frontend and backend with a single script.

**Windows:**
```bat
install.bat
```

**Linux / macOS:**
```bash
chmod +x install.sh
./install.sh
```

> The script automatically verifies your prerequisites and installs all required packages.

## Prerequisites

Ensure you have the following installed before running setup:

- **Node.js** v22+
- **npm** v10+
- **PostgreSQL** v16+

## Environment Variables

Copy the example file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

| Variable       | Description                                 | Default                                            |
| -------------- | ------------------------------------------- | -------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                | `postgresql://postgres:password@localhost:5432/transitops` |
| `PORT`         | Backend server port                         | `5000`                                             |
| `JWT_SECRET`   | Secret key for signing JWT tokens           | *(required)*                                       |

## Running the Application

After setup completes, start both servers in separate terminal windows.

**1. Start the Backend:**
```bash
cd backend
npm run dev
```

**2. Start the Frontend:**
```bash
cd WEBSITE
npm run dev
```

## Default Ports

| Service               | Port   | URL                          |
| --------------------- | ------ | ---------------------------- |
| Frontend (Next.js)    | `3000` | http://localhost:3000        |
| Backend (Express)     | `5000` | http://localhost:5000        |
| Database (PostgreSQL) | `5432` | localhost:5432               |

## Verifying the Connection

1. Ensure both servers are running.
2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
3. If you see the TransitOps dashboard, everything is connected and ready.

## Demo Accounts

| Role               | Email                    | Password   |
| ------------------ | ------------------------ | ---------- |
| Fleet Manager      | `fleet@transitops.dev`   | `demo1234` |
| Dispatcher         | `dispatch@transitops.dev`| `demo1234` |
| Safety Officer     | `safety@transitops.dev`  | `demo1234` |
| Financial Analyst  | `finance@transitops.dev` | `demo1234` |

## Key Features

- **Role-Based Access Control** — 4 distinct roles with scoped permissions
- **Dashboard KPIs** — Live fleet utilization, active trips, driver availability
- **Vehicle Registry** — Full lifecycle management with status automation
- **Driver Management** — License expiry tracking, safety scores, status enforcement
- **Trip Dispatch** — Business-rule-validated dispatch with automatic status transitions
- **Maintenance Workflow** — Instantly locks vehicles out of dispatch when in shop
- **Fuel & Expense Tracking** — Per-vehicle operational cost computation
- **Analytics & Reports** — Fuel efficiency, ROI, utilization charts + CSV/PDF export
- **Dark Mode** — Full theme toggle, persisted per user

## Team

See [Contributions.md](./Contributions.md) for team member roles and work breakdown.

## License

MIT © 2026 Viaxis
