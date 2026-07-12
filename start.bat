@echo off
echo =========================================
echo    TransitOps — Local Startup Script
echo =========================================
echo.

echo [INFO] Cleaning up active processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

echo [INFO] Starting Next.js App Server (Frontend + API)...
cd WEBSITE\frontend
echo [INFO] Wiping stale Next.js cache...
if exist .next rd /s /q .next
npm run build && npm start
