@echo off
echo Starting TYForge Backend Locally...
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

echo 🔧 Setting up environment...
echo 🗄️  Connecting to Neon Database...
echo 🌐 CORS configured for localhost and production domains...
echo.

REM Start the backend server
python run.py

echo.
echo Backend stopped.
pause