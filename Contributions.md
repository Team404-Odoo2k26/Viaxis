# Contributions

> Team **Team404** — Odoo Yearly Hackathon 2026

This document tracks each team member's responsibilities and work done throughout the hackathon.

---

## Team Members

| Name | Role | Email | GitHub |
| ---- | ---- | ----- | ------ |
| Ahad Dangarvawala | Security focused full stack engineer | ahaddangarvawala@gmail.com | @ahad |

---

## Work Breakdown

### Repository & Project Setup *(Ahad Dangarvawala)*
- [x] Defined overall project architecture and tech stack (Next.js + Express + PostgreSQL/Prisma)
- [x] Initialized Git repository with branch strategy and commit conventions
- [x] Wrote comprehensive project `README.md` — overview, setup guide, demo accounts, ports
- [x] Created `install.bat` and `install.sh` automated setup scripts with prerequisite checks
- [x] Configured root `.gitignore` covering all frontend, backend, and environment artifacts
- [x] Defined complete Prisma database schema for all 7 TransitOps entities (User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense)
- [x] Set up `WEBSITE/backend/` scaffold — `package.json` with all dependencies, `.env.example`, `.gitignore`
- [x] Set up `WEBSITE/frontend/` scaffold — Next.js config, `.gitignore`
- [x] Maintained `Contributions.md` — team roles and work tracking
- [x] Initial commit: `chore: initial project scaffold — TransitOps base setup`

### Authentication & RBAC
- [ ] TBD

### Dashboard & KPIs
- [ ] TBD

### Vehicle Registry
- [ ] TBD

### Driver Management
- [ ] TBD

### Trip Management & Dispatch
- [ ] TBD

### Maintenance Workflow
- [ ] TBD

### Fuel & Expense Tracking
- [ ] TBD

### Analytics & Reports
- [ ] TBD

### Backend API & Database
- [ ] TBD

### UI/UX & Frontend Integration
- [ ] TBD

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
