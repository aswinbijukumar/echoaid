## EchoAid Architecture Overview

This document maps directories and the recognition flow so contributors can navigate quickly.

### Top-level
- `backend/` — Node.js API (Express) and assets
- `frontend/` — React + Vite web client
- `ML_INTEGRATION_GUIDE.md` — High-level integration steps
- `SIGN_RECOGNITION_SYSTEM.md`, `UNIFIED_LEARNING_SYSTEM.md` — system design docs

### Backend
- `backend/server.js` — Express app entry
- `backend/config/` — DB config
- `backend/controllers/`, `routes/`, `middleware/`, `models/` — core API
- `backend/assets/` — sign images (source and optimized)
- `backend/scripts/` — admin/db utilities
- `backend/recognition/` — recognition plans and Python ML service
  - `python_service/` — FastAPI microservice for scoring landmark vectors
    - `train.py` — trains a KNN model from `data/landmarks.json`
    - `app/main.py` — FastAPI app exposing `/health` and `/score`
    - `requirements.txt` — Python deps

### Frontend
- `frontend/src/pages/` — app screens
- `frontend/src/components/` — UI components (used in production)
- `frontend/src/context/` — React context providers (Auth, Theme)
- `frontend/src/hooks/` — custom hooks
- `frontend/src/experiments/` — non-production/experimental components

### Recognition Flow (current)
1) Browser captures webcam/upload
2) Frontend extracts landmarks (planned: MediaPipe Tasks)
3) Frontend sends landmarks → Node backend endpoint (recommended)
4) Node backend calls Python FastAPI `/score` to get score/label
5) Backend returns structured result to frontend

### Conventions
- Place experimental or mock components under `frontend/src/experiments/`
- Keep production components under `frontend/src/components/`
- Prefer sending landmark vectors over images for privacy

