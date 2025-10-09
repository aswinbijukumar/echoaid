## EchoAid Architecture Overview

This document maps directories and the application flow so contributors can navigate quickly.

### Top-level
- `backend/` — Node.js API (Express) and assets
- `frontend/` — React + Vite web client
- (Recognition-related guides were removed as the ML service is no longer included)

### Backend
- `backend/server.js` — Express app entry
- `backend/config/` — DB config
- `backend/controllers/`, `routes/`, `middleware/`, `models/` — core API
- `backend/assets/` — sign images (source and optimized)
- `backend/scripts/` — admin/db utilities
- (Recognition directory was removed)

### Frontend
- `frontend/src/pages/` — app screens
- `frontend/src/components/` — UI components (used in production)
- `frontend/src/context/` — React context providers (Auth, Theme)
- `frontend/src/hooks/` — custom hooks
- `frontend/src/experiments/` — non-production/experimental components

### Application Flow (current)
1) User interacts with React frontend (dictionary, quizzes, admin tools)
2) Frontend calls Node.js API for data and actions
3) Backend serves assets and responds with JSON from MongoDB

### Conventions
- Place experimental or mock components under `frontend/src/experiments/`
- Keep production components under `frontend/src/components/`
- Prefer sending landmark vectors over images for privacy

