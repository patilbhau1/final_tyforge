@echo off
echo ============================================================
echo Starting TY Project Launchpad - FRONTEND (Local Development)
echo ============================================================

REM Navigate to frontend directory
cd /d "%~dp0frontend"

echo 🔧 Installing dependencies if needed...
if not exist "node_modules" (
    echo 📦 Installing npm packages...
    npm install
)

echo 🚀 Starting Vite development server...
echo 🌐 Frontend will be available at: http://localhost:5173
echo 🔄 Backend API configured to: http://localhost:8000
echo.

REM Start the frontend development server
npm run dev

echo.
echo Frontend server stopped.
pause