# Contributions

> Team **Team404** — Odoo Yearly Hackathon 2026

This document tracks each team member's responsibilities and work done throughout the hackathon.

---

## Team Members

| Name | Role | GitHub |
| ---- | ---- | ------ |
| TBD  | TBD  | @TBD   |

---

## Work Breakdown

### Authentication & RBAC
- [x] Login page implementation with invalid attempts lockout logic.
- [x] Role-Based Access Control matrix gatekeeping with module access & edit controls (`src/lib/rbac.ts`).

### Dashboard & KPIs
- [x] Dynamic dashboard KPI cards (Active Vehicles, Available Vehicles, Active Trips, Utilization Rate).
- [x] Vehicle status breakdown visual progress bars and recent trips list.

### Vehicle Registry
- [x] Vehicle list table with search, category filtering, status pills, and modal to register new vehicles.
- [x] Verification of unique registration numbers.

### Driver Management
- [x] Driver list table showing details, trip completion rate, and safety score.
- [x] Expired driver licenses flagged visually and blocked from dispatch pools.
- [x] Toggle driver status (Available, Off Duty, Suspended).

### Trip Management & Dispatch
- [x] Multi-step trip lifecycle stepper (Draft → Dispatched → Completed / Cancelled).
- [x] Real-time cargo weight verification against maximum vehicle load.
- [x] Automated status transitions releasing vehicles/drivers back to available upon completion or cancellation.

### Maintenance Workflow
- [x] Service log registry at `/maintenance`.
- [x] Active maintenance records automatically transition vehicle status to "In Shop".
- [x] Completing service records releases vehicle status back to "Available".

### Fuel & Expense Tracking
- [x] Fuel Log modal tracking litters and price per log at `/fuel-expenses`.
- [x] Expense logger tracking tolls, linked maintenance, and other fees.
- [x] Dynamic Operational Cost calculation (`Fuel + Maintenance`).

### Analytics & Reports
- [x] Dynamic KPI cards mapping Fleet ROI (formula displayed inline), Fuel Efficiency, Fleet Utilization, and Operational Cost.
- [x] Recharts BarChart rendering Monthly Revenue.
- [x] Rank-list detailing Top Costliest Vehicles.
- [x] Downloadable CSV report and optimized PDF printing layout.

### Backend API & Database
- [x] PostgreSQL database setup (`database/schema.sql`).
- [x] Database initial data loading (`database/seed.sql`).
- [x] REST API endpoints (`/api/...`) connecting Next.js server-side queries to PostgreSQL.

### UI/UX & Frontend Integration
- [x] Monochromatic minimalist visual style matching Notion design.
- [x] Dynamic theme toggle support (Dark Mode and Light Mode).
- [x] Framer Motion micro-animations for cards, layout pages, and table row staggers.
- [x] Quick-access Cmd+K Command Palette for modules.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     a new feature
fix:      a bug fix
docs:     documentation only changes
style:    formatting, no logic change
refactor: code change that is not a fix or feature
chore:    build process, dependency updates
```

**Example:**
```
feat(trips): add cargo weight validation on dispatch
fix(drivers): prevent expired license assignment
docs: update contribution roles
```
