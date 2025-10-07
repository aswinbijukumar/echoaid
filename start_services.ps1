# EchoAid Services Startup Script
Write-Host "Starting EchoAid Services..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\echoaid\backend; npm start"

Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "[2/3] Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\echoaid\frontend; npm run dev"

Start-Sleep -Seconds 3

# Start Python ML Service
Write-Host "[3/3] Starting Python ML Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\echoaid\backend\recognition\python_service; ..\..\..\..\.venv\Scripts\activate; python app\yolov5_main.py"

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000 (or 5173)" -ForegroundColor Cyan  
Write-Host "Python ML: http://localhost:8001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")