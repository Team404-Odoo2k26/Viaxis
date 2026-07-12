# Contributions

> Team **Team404** — Odoo Yearly Hackathon 2026

This document tracks each team member's responsibilities and work done throughout the hackathon.

---

## Team Members

| Name | Role | Email | GitHub |
| ---- | ---- | ----- | ------ |
| Ahad Dangarvawala | Security focused full stack | ahaddangarvawala@gmail.com | @ahadd |
| Dhruv Gohel | Full stack | | @dhruvgohel |
| Vishmayraj Zala | AI/ML | | @vishmayraj |
| Varun Kushwaha | Backend / API Engineer | | @varunkushwaha |

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

### API Test Suite *(Varun Kushwaha)*

> All tests run in a fully isolated environment — database is always mocked, zero risk to main code or production builds.

#### Phase 1 — Test Infrastructure Setup
- [x] Installed `jest`, `ts-jest`, `@types/jest`, and `node-mocks-http` as strict `devDependencies`.
- [x] Created `jest.config.ts` with `testEnvironment: 'node'` and `roots: ['<rootDir>/test']` to hard-isolate tests from `src/`.
- [x] Created `tsconfig.jest.json` — a separate TypeScript compiler config exclusively for the test suite.
- [x] Created `jest.setup.ts` with a global database mock (`jest.mock('@/lib/db')`) to prevent any real DB calls during tests.
- [x] Added `"test": "jest"` script to `package.json`.

#### Phase 2 — Analytics & Auth
- [x] `test/api/analytics/route.test.ts` — Verifies `fuel_efficiency`, `fleet_utilization`, `operational_cost`, and `vehicle_roi` calculations using mocked DB responses.
- [x] `test/api/auth/login/route.test.ts` — Tests successful login, account lockout (`423`), and failed-attempt increment logic (`401`).

#### Phase 3 — Core Functional Areas
- [x] `test/api/dashboard/route.test.ts` — Verifies KPI aggregation and `fleet_utilization` math using mocked stats and breakdown queries.
- [x] `test/api/drivers/route.test.ts` — Tests `GET` (list all) and `POST` (create with duplicate license rejection).
- [x] `test/api/drivers/[id]/route.test.ts` — Tests `PATCH` for updating driver fields.
- [x] `test/api/vehicles/route.test.ts` — Tests `GET` with dynamic filter params and `POST` with duplicate registration rejection.
- [x] `test/api/vehicles/[id]/route.test.ts` — Tests `PATCH` update and duplicate registration guard.

#### Phase 4 — Operational Data
- [x] `test/api/expenses/route.test.ts` — Tests `GET` listing and `POST` expense creation.
- [x] `test/api/fuel/route.test.ts` — Tests `GET` and `POST` fuel log insertion.
- [x] `test/api/maintenance/route.test.ts` — Tests `POST` verifying the side effect that sets vehicle status to `"In Shop"`.
- [x] `test/api/maintenance/[id]/route.test.ts` — Tests `PATCH` verifying that completing a maintenance log releases vehicle back to `"Available"`, and `404` on missing records.

#### Phase 5 — Final Areas
- [x] `test/api/settings/route.test.ts` — Tests `GET` (fetch app config) and `PATCH` (update depot settings).
- [x] `test/api/trips/route.test.ts` — Tests `GET`, cargo overweight rejection, suspended driver rejection, and successful trip creation.
- [x] `test/api/trips/[id]/route.test.ts` — Tests `PATCH` dispatch flow (marks vehicle + driver as `"On Trip"`) and complete flow (frees both assets back to `"Available"`).

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
