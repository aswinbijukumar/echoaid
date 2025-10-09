# EchoAid YOLOv5 Recognition Service

This service provides simple endpoints for sign recognition using your YOLOv5 weights.

## Endpoints
- `GET /health` — service and model status
- `POST /detect` — multipart image file field `file` → JSON detections

## Setup
1) Create and activate a virtual environment
```bash
cd backend/recognition/python_service
python -m venv .venv
.venv\Scripts\activate  # Windows
```

2) Install dependencies
```bash
pip install -r requirements.txt
```

3) Place your YOLOv5 weights
- Put your trained `.pt` file at `backend/recognition/python_service/weights/isl_yolov5s.pt` (or set `MODEL_PATH` env var to another file).

4) Start the service
```bash
uvicorn app.main:app --reload --port 8001
```

## Using the YOLOv5 notebook
- See `backend/yolov5installationfiles/ISL Detection Yolov5.ipynb` to clone YOLOv5, download weights, train/evaluate.
- Export or copy the best weights to the `weights/` folder above.

## Environment variables (optional)
- `MODEL_PATH` — path to `.pt` weights (default: `weights/isl_yolov5s.pt`)
- `CONF_THRES` — confidence threshold (default: `0.25`)
- `IOU_THRES` — NMS IoU threshold (default: `0.45`)
- `DEVICE` — `cpu` or `cuda:0`