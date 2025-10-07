@echo off
echo Starting EchoAid Services...
echo.

echo [1/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d D:\echoaid\backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d D:\echoaid\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Python ML Service...
start "Python ML Service" cmd /k "cd /d D:\echoaid\backend\recognition\python_service && ..\..\..\..\.venv\Scripts\activate && python app\yolov5_main.py"

echo.
echo All services are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000 (or 5173)
echo Python ML: http://localhost:8001
echo.
echo Press any key to exit...
pause >nul