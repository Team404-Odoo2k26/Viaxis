@echo off
echo =========================================
echo    TransitOps — Local Startup Script
echo =========================================
echo.

echo [INFO] Starting Backend Server (Express + Prisma)...
start cmd /k "cd WEBSITE\backend && npm run dev"

echo [INFO] Starting Frontend Server (Next.js)...
start cmd /k "cd WEBSITE\frontend && npm run dev"

echo.
echo [SUCCESS] Both servers are launching in separate windows!
echo.
pause
