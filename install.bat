@echo off
setlocal enabledelayedexpansion

echo [INFO] === TransitOps Full-Stack Setup ===
echo [INFO] Checking prerequisites...

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [31m[ERROR] Node.js is not installed or not in PATH. Please install Node.js v22+.[0m
    exit /b 1
)

:: Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [31m[ERROR] npm is not installed or not in PATH. Please install npm v10+.[0m
    exit /b 1
)

:: Check for PostgreSQL
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [31m[ERROR] PostgreSQL (psql command) is not installed or not in PATH. Please install PostgreSQL v16+.[0m
    exit /b 1
)

echo  [32m[SUCCESS] All prerequisites are installed![0m
echo.

:: Check backend .env
if not exist "backend\.env" (
    echo [INFO] Creating backend\.env from example...
    copy "backend\.env.example" "backend\.env" >nul
    echo  [33m[WARNING] backend\.env created — please update your DATABASE_URL and JWT_SECRET before starting.[0m
    echo.
)

echo [INFO] Installing Backend dependencies...
cd backend
call npm install
echo [INFO] Generating Prisma Client...
call npx prisma generate
cd ..

echo [INFO] Installing Frontend dependencies...
cd WEBSITE
call npm install
cd ..

echo.
echo [32m=====================================[0m
echo [32m  Setup Completed Successfully!      [0m
echo [32m=====================================[0m
echo.

echo [COMMANDS] To run the backend, open a terminal and run:
echo   cd backend
echo   npm run dev
echo.

echo [COMMANDS] To run the frontend, open a second terminal and run:
echo   cd WEBSITE
echo   npm run dev
echo.

pause
