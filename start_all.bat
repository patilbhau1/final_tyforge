@echo off
echo ============================================================
echo TY PROJECT LAUNCHPAD - Starting All Services
echo ============================================================
echo.
echo Starting Backend and Frontend in separate windows...
echo.

REM Start Backend in new window
start "TY Launchpad - Backend" cmd /k "cd backend_new && python run.py"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak

REM Start Frontend in new window
start "TY Launchpad - Frontend" cmd /k "cd ty-project-launchpad-new-version && npm run dev"

echo.
echo ============================================================
echo Both services are starting in separate windows!
echo ============================================================
echo.
echo Backend: http://localhost:8000
echo Backend Docs: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the browser...
pause > nul

REM Open browser to frontend
start http://localhost:5173

echo.
echo To stop services, close the terminal windows.
echo.
