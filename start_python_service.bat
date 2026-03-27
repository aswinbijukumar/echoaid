@echo off
setlocal

cd /d %~dp0backend\recognition\python_service

REM Create venv if not present
if not exist .venv (
  echo Creating virtual environment...
  where py >nul 2>nul
  if %errorlevel%==0 (
    py -3.11 -m venv .venv
  ) else (
    python -m venv .venv
  )
)

call .venv\Scripts\activate
python -m pip install --upgrade pip --quiet

echo Installing Keras + MediaPipe dependencies...
pip install --prefer-binary -r requirements.txt

set PORT=8001
echo.
echo Starting EchoAid Keras Recognition Service on port %PORT%...
echo.
python -m uvicorn app.main:app --reload --port %PORT%

endlocal