@echo off
echo Starting EchoAid Services...
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d D:\echoaid\backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d D:\echoaid\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo All services are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul