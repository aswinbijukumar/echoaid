import os
import io
import time
from typing import List, Optional

import torch
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# Configuration
DEFAULT_WEIGHT_PRIMARY = os.path.normpath(os.path.join(os.getcwd(), "..", "..", "yolov5installationfiles", "last .pt"))
DEFAULT_WEIGHT_FALLBACK = os.path.join(os.getcwd(), "weights", "isl_yolov5s.pt")
MODEL_PATH = os.environ.get("MODEL_PATH", DEFAULT_WEIGHT_PRIMARY)
CONF_THRES = float(os.environ.get("CONF_THRES", "0.25"))  # Increased from 0.10 to 0.25
IOU_THRES = float(os.environ.get("IOU_THRES", "0.50"))   # Increased from 0.45 to 0.50
DEVICE = os.environ.get("DEVICE", "cpu")  # e.g., "cuda:0" if available

app = FastAPI(title="EchoAid YOLOv5 Recognition Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
model_names: List[str] = []

class Detection(BaseModel):
    label: str
    confidence: float
    box: List[float]  # [x1, y1, x2, y2]

class DetectResponse(BaseModel):
    success: bool
    time_ms: float
    detections: List[Detection]


def load_model():
    global model, model_names
    # Resolve a suitable default if MODEL_PATH not found
    chosen_path = MODEL_PATH
    if not os.path.exists(chosen_path):
        if os.path.exists(DEFAULT_WEIGHT_FALLBACK):
            chosen_path = DEFAULT_WEIGHT_FALLBACK
        else:
            raise FileNotFoundError(
                f"Weights not found. Tried: {MODEL_PATH} and {DEFAULT_WEIGHT_FALLBACK}. "
                f"Set MODEL_PATH env or place weights accordingly."
            )
    # Use torch.hub to load YOLOv5; require Git for first-time fetch
    print(f"[startup] Loading YOLOv5 weights from: {chosen_path} on device={DEVICE}")
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=chosen_path, device=DEVICE, trust_repo=True)  # type: ignore
    model.conf = CONF_THRES  # confidence threshold
    model.iou = IOU_THRES    # IoU threshold for NMS
    raw_names = getattr(model, 'names', [])
    # Normalize class names to a simple list of strings
    if isinstance(raw_names, dict):
      # YOLOv5 exports names as {0: 'A', 1: 'B', ...}
      model_names = [raw_names[k] for k in sorted(raw_names.keys())]
    elif isinstance(raw_names, (list, tuple)):
      model_names = list(raw_names)
    else:
      model_names = []
    # Warmup
    try:
      model(torch.zeros(1, 3, 640, 640))
    except Exception:
      pass
    preview = model_names[:10] if isinstance(model_names, list) else []
    print(f"[startup] Model ready. classes={len(model_names)} -> {preview}...")


@app.on_event("startup")
def startup_event():
    load_model()


@app.get("/health")
def health():
    return {
      "success": True,
      "message": "YOLOv5 service healthy",
      "model_path": MODEL_PATH,
      "device": DEVICE,
      "classes": model_names,
      "num_classes": len(model_names)
    }


@app.post("/detect", response_model=DetectResponse)
async def detect(
    file: UploadFile = File(...),
    conf: Optional[float] = Query(None, description="Override confidence threshold for this request (0.0-1.0)")
):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert('RGB')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    t0 = time.time()
    # Allow per-request confidence override
    prev_conf = getattr(model, 'conf', None)
    try:
        if conf is not None:
            try:
                model.conf = max(0.0, min(1.0, float(conf)))
            except Exception:
                pass
        results = model(image, size=640)
    finally:
        # restore model.conf
        try:
            if prev_conf is not None:
                model.conf = prev_conf
        except Exception:
            pass
    # results.xyxy[0]: (N, 6) -> x1,y1,x2,y2,conf,cls
    detections: List[Detection] = []
    try:
        preds = results.xyxy[0].cpu().numpy()
        # Debug: log number of detections and first few scores
        try:
            print(f"[detect] received image {len(content)} bytes, preds shape={getattr(results.xyxy[0], 'shape', None)}")
            if len(preds) > 0:
                print(f"[detect] top detection: class={preds[0][5]}, confidence={preds[0][4]:.3f}")
        except Exception:
            pass
        
        # Filter detections by confidence and validate
        for x1, y1, x2, y2, conf, cls_id in preds:
            cls_idx = int(cls_id)
            label = model_names[cls_idx] if 0 <= cls_idx < len(model_names) else str(cls_idx)
            
            # Additional validation: check if detection is reasonable
            box_width = x2 - x1
            box_height = y2 - y1
            box_area = box_width * box_height
            
            # Skip very small detections (likely false positives)
            if box_area < 100:  # Minimum 100 pixels area
                print(f"[detect] Skipping small detection: {label} (area: {box_area:.1f})")
                continue
                
            # Skip detections that are too large (likely background)
            image_area = image.width * image.height
            if box_area > image_area * 0.8:  # Max 80% of image
                print(f"[detect] Skipping large detection: {label} (area: {box_area:.1f})")
                continue
            
            detections.append(Detection(
                label=label,
                confidence=float(conf),
                box=[float(x1), float(y1), float(x2), float(y2)]
            ))
            
        print(f"[detect] Final detections: {len(detections)} valid detections")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Postprocess error: {e}")

    dt_ms = (time.time() - t0) * 1000.0
    return DetectResponse(success=True, time_ms=dt_ms, detections=detections)