@echo off
echo Starting Legal AI Assistant...
echo.

:: 1. Start Backend Server (Background)
echo Starting Backend Server (Port 3001)...
start "Legal AI Backend" cmd /k "node server.js"

:: Wait a moment for backend to initialize
timeout /t 2 /nobreak >nul

:: 2. Start Frontend Server (Background)
echo Starting Frontend Server (Port 5173)...
start "Legal AI Frontend" cmd /k "npm run dev"

:: Wait for frontend to spin up
timeout /t 4 /nobreak >nul

:: 3. Open Browser
echo Opening Application...
start http://localhost:5173

echo.
echo Application launched! You can close this window if you wish, 
echo but keep the "Backend" and "Frontend" windows open.
pause
