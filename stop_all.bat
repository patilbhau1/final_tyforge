@echo off
echo ============================================================
echo Stopping TY Project Launchpad Services
echo ============================================================
echo.

REM Kill processes on port 8000 (Backend)
echo Stopping Backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a 2>nul

REM Kill processes on port 5173 (Frontend)
echo Stopping Frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a 2>nul

REM Kill Node.js processes
echo Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul

REM Kill Python processes (be careful with this one)
echo Stopping Python backend processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq TY Launchpad - Backend*" 2>nul

echo.
echo ============================================================
echo All services stopped!
echo ============================================================
pause
