@echo off
setlocal

cd /d %~dp0backend\recognition\python_service
REM Prefer Python 3.12 for fastest prebuilt wheels
where py >nul 2>nul
if %errorlevel%==0 (
  echo Creating virtual environment with Python 3.12...
  py -3.12 -m venv .venv
) else (
  echo Python launcher not found. Falling back to default python.
  if not exist .venv (
    python -m venv .venv
  )
)

call .venv\Scripts\activate
python -m pip install --upgrade pip
REM Force binary wheels to avoid slow source builds
pip config set global.only-binary :all:

echo Installing PyTorch CPU wheels...
python -m pip install --prefer-binary --index-url https://download.pytorch.org/whl/cpu torch torchvision

echo Installing remaining dependencies...
python -m pip install --prefer-binary -r requirements.txt

set PORT=8001
python -m uvicorn app.main:app --reload --port %PORT%

endlocal