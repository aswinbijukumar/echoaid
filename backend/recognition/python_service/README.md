# EchoAid Python Recognition Service

A FastAPI microservice that scores sign landmarks using a lightweight classifier (KNN). The frontend/browser extracts landmarks (e.g., via MediaPipe) and sends flattened vectors to this service.

## Quickstart

```
cd backend/recognition/python_service
python -m venv .venv
# Windows PowerShell
. .venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt

# Prepare dataset file (see Dataset Format below)
python train.py

# Run service
uvicorn app.main:app --reload --port 8001
```

## API
- GET /health → `{ status: 'ok', modelLoaded: boolean }`
- POST /score → body `{ landmarks: number[], signId?: string }`
  - returns `{ success, score, label?, probs? }`

## Dataset Format
Create `data/landmarks.json` with:
```json
{
  "labels": ["hello", "thank-you", "please"],
  "samples": [
    [0.1, 0.2, 0.3, 0.4],
    [0.05, -0.12, 0.8, 0.1]
  ],
  "y": [0, 2]
}
```
- `labels[i]` is the class name for integer ID `i`.
- `samples` contains flattened landmark vectors of equal length.
- `y` contains the integer label for each sample row.

## Local Landmark Extraction
You can convert a folder dataset (`dataset_root/<label>/*.jpg`) into `landmarks.json` using:

```
python extract_landmarks.py /path/to/dataset_root --out data/landmarks.json
```

- Uses MediaPipe Hands to produce a 126-dim vector per image (left + right hands).
- Keep class folder names clean; they become `labels` in the output.

## Notes
- Start simple with KNN. You can swap in SVM, logistic regression, or a small neural model later.
- Keep features normalized (e.g., scale to 0-1 or z-score), and use consistent ordering.
- Prefer sending landmarks (privacy) instead of images.

