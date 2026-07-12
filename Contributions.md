# Contributions

> Team **Team404** — Odoo Yearly Hackathon 2026

This document tracks each team member's responsibilities and work done throughout the hackathon.

---

## Team Members

| Name | Role | Email | GitHub |
| ---- | ---- | ----- | ------ |
| Ahad Dangarvawala | Security focused full stack engineer | ahaddangarvawala@gmail.com | @ahadd |
| Dhruv Gohel | Frontend Engineer | | @dhruvgohel |
| Vishmayraj Zala | Backend / API Engineer | | @vishmayraj |
| Varun Kushwaha | UI/UX & Full Stack Engineer | | @varunkushwaha |

---

## Work Breakdown

### Repository Setup & Bug Fixes *(Ahad Dangarvawala)*
- [x] Initial project scaffold: TransitOps base setup, configurations, and environment templates.
- [x] Fixed syntax errors and directory paths in `install.bat` and `install.sh`.
- [x] Successfully ran setup scripts to install all frontend (Next.js) and backend (Express/Prisma) dependencies, and generated Prisma client.

### Dashboard & KPIs *(Dhruv Gohel)*
- [x] Initialize frontend application, create core dashboard pages, and add cross-platform startup scripts.
- [x] Dynamic dashboard KPI cards (Active Vehicles, Available Vehicles, Active Trips, Utilization Rate).
- [x] Vehicle status breakdown visual progress bars and recent trips list.

### Vehicle Registry *(Dhruv Gohel)*
- [x] Vehicle list table with search, category filtering, status pills, and modal to register new vehicles.
- [x] Verification of unique registration numbers.

### Trip Management & Dispatch *(Dhruv Gohel)*
- [x] Initialize fleet management frontend and API layer with trip lifecycle logic.
- [x] Multi-step trip lifecycle stepper (Draft → Dispatched → Completed / Cancelled).
- [x] Real-time cargo weight verification against maximum vehicle load.
- [x] Automated status transitions releasing vehicles/drivers back to available upon completion or cancellation.

### Maintenance Workflow *(Dhruv Gohel)*
- [x] Implement maintenance and settings pages with RBAC and TypeScript configuration.
- [x] Service log registry at `/maintenance`.
- [x] Active maintenance records automatically transition vehicle status to "In Shop".
- [x] Completing service records releases vehicle status back to "Available".

### Fuel & Expense Tracking *(Dhruv Gohel)*
- [x] Implement fuel and expense tracking dashboard with cost visualization.
- [x] Fuel Log modal tracking litters and price per log at `/fuel-expenses`.
- [x] Expense logger tracking tolls, linked maintenance, and other fees.
- [x] Dynamic Operational Cost calculation (`Fuel + Maintenance`).

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
