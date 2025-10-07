# Recognition Service Plan

This folder documents the sign recognition pipeline for EchoAid.

## Phase 1: Stubbed Scoring (Done)
- Endpoint: `POST /api/practice/recognize` accepts an image + `signId`.
- Auth required. Stores a `PracticeAttempt` with a dummy score and feedback.
- Endpoint: `GET /api/practice/attempts/recent` returns user attempts.

## Phase 2: Client-Side Landmarks (Fast Iteration)
- Use MediaPipe Hands/Pose in the browser to extract landmarks from webcam or uploaded images.
- Normalize and send landmark vectors (not raw images) to the backend.
- Backend computes a similarity score to a reference template per sign.

## Phase 3: Lightweight Classifier
- Train a classifier (KNN / SVM / small TF.js model) on landmark features for each sign.
- Optionally run entirely client-side with TF.js for low latency.

## Phase 4: Server-Side Python Microservice (Optional)
- Set up a Python service (FastAPI) with a trained classifier on landmarks.
- Node backend calls Python via HTTP; receives score + structured feedback.

### Python Service API (initial)
- `GET /health` → `{ status: 'ok', modelLoaded: boolean }`
- `POST /score` → body: `{ signId?: string, landmarks: number[] }`
  - response: `{ success: boolean, score: number, label?: string, probs?: number[] }`

### Run locally
```
cd backend/recognition/python_service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python train.py  # produces models/knn.joblib
uvicorn app.main:app --reload --port 8001
```

## Data & Feedback Strategy
- Collect labeled samples per sign (images or landmarks).
- Compare user landmarks to reference using cosine similarity / DTW.
- Generate feedback from largest landmark deltas (handshape, position, orientation).

## Security & Privacy
- Prefer landmarks over images when possible.
- If images are used, store in secure buckets (Cloudinary/S3) with short-lived URLs.

## API Contract (current)
- `POST /api/practice/recognize` (multipart/form-data)
  - fields: `signId`, `image` file
  - response: `{ success, data: { score, feedback, sign, createdAt } }`
- `GET /api/practice/attempts/recent`
  - response: `{ success, data: PracticeAttempt[] }`

