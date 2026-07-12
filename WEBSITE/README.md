# WEBSITE

This directory contains the full-stack web application for TransitOps.

## Structure

```
WEBSITE/
├── frontend/    # Next.js 15 + React 19 + Tailwind CSS v4
└── backend/     # Express.js + Prisma ORM + PostgreSQL
```

## Setup

From the project root, run the install script:

```bat
# Windows
install.bat

# Linux / macOS
./install.sh
```

Or install manually:

```bash
# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd frontend
npm install
```

## Running

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm run dev
```

## API Base URL

The frontend expects the backend at `http://localhost:5000`.
