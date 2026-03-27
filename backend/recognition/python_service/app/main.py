import os
import io
import json
import time
import base64
import numpy as np
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# ─── Config ───────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.h5")
CLASS_MAP  = os.path.join(BASE_DIR, "class_mapping.json")
CONF_THRES = float(os.environ.get("CONF_THRES", "0.30"))

# ─── Load class labels ────────────────────────────────────────────────────────
with open(CLASS_MAP, "r") as f:
    CLASS_LABELS: List[str] = json.load(f)

# ─── Lazy-load heavy libs so startup is fast ─────────────────────────────────
tf_model      = None
mp_hands      = None
mp_drawing    = None

def _load_models():
    global tf_model, mp_hands, mp_drawing
    if tf_model is not None:
        return
    import tensorflow as tf
    import mediapipe as mp
    tf_model   = tf.keras.models.load_model(MODEL_PATH)
    mp_hands   = mp.solutions.hands
    mp_drawing = mp.solutions.drawing_utils
    print(f"[startup] Keras model loaded from {MODEL_PATH}")
    print(f"[startup] Classes: {CLASS_LABELS}")


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="EchoAid Keras Recognition Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ──────────────────────────────────────────────────────────────────
class Detection(BaseModel):
    label: str
    confidence: float
    box: List[float] = []

class DetectResponse(BaseModel):
    success: bool
    time_ms: float
    detections: List[Detection]

class ScoreRequest(BaseModel):
    image: str          # base64 or data-URL
    isISL: bool = True
    signId: Optional[str] = None

class ScoreResponse(BaseModel):
    success: bool
    time_ms: float
    detections: List[Detection]
    label: Optional[str] = None
    confidence: Optional[float] = None
    source: str = "keras-mediapipe"
    bounding_box: Optional[List[float]] = None
    landmarks: List = []
    all_predictions: List = []


# ─── Helper: extract landmarks + run model ────────────────────────────────────
def _predict_from_pil(pil_image: Image.Image):
    """
    Run MediaPipe hand detection on a PIL image, extract 63 landmarks,
    feed them through the Keras model, and return (label, confidence, all_preds).
    Returns (None, 0.0, []) if no hand is found.
    """
    import mediapipe as mp
    import cv2

    img_rgb = np.array(pil_image.convert("RGB"))

    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.4,
    ) as hands:
        results = hands.process(img_rgb)

    if not results.multi_hand_landmarks:
        print("[predict] No hand detected in image")
        return None, 0.0, []

    # Flatten 21 landmarks × 3 coords = 63 features
    lm_list = results.multi_hand_landmarks[0].landmark
    features = []
    for lm in lm_list:
        features.extend([lm.x, lm.y, lm.z])

    features = np.array(features, dtype=np.float32).reshape(1, -1)
    preds    = tf_model.predict(features, verbose=0)[0]  # shape (num_classes,)

    top_idx  = int(np.argmax(preds))
    top_conf = float(preds[top_idx])
    label    = CLASS_LABELS[top_idx] if top_idx < len(CLASS_LABELS) else str(top_idx)

    all_preds = [
        {"label": CLASS_LABELS[i] if i < len(CLASS_LABELS) else str(i),
         "confidence": float(preds[i])}
        for i in np.argsort(preds)[::-1][:5]
    ]

    print(f"[predict] top={label} ({top_conf:.3f}), all={[p['label'] for p in all_preds]}")
    return label, top_conf, all_preds


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    _load_models()


@app.get("/health")
def health():
    return {
        "success": True,
        "message": "Keras-MediaPipe service healthy",
        "model_path": MODEL_PATH,
        "classes": CLASS_LABELS,
        "num_classes": len(CLASS_LABELS),
    }


@app.post("/detect", response_model=DetectResponse)
async def detect(
    file: UploadFile = File(...),
    conf: Optional[float] = Query(None),
):
    _load_models()
    try:
        content = await file.read()
        image   = Image.open(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    threshold = conf if conf is not None else CONF_THRES
    t0 = time.time()
    label, confidence, _ = _predict_from_pil(image)
    dt_ms = (time.time() - t0) * 1000.0

    detections = []
    if label and confidence >= threshold:
        detections.append(Detection(label=label, confidence=confidence))

    return DetectResponse(success=True, time_ms=dt_ms, detections=detections)


@app.post("/score", response_model=ScoreResponse)
async def score(request: ScoreRequest):
    """Backend-compatible endpoint that accepts base64 image data."""
    _load_models()
    try:
        raw = request.image
        if raw.startswith("data:"):
            _, encoded = raw.split(",", 1)
        else:
            encoded = raw
        image_data = base64.b64decode(encoded)
        image      = Image.open(io.BytesIO(image_data))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")

    t0 = time.time()
    label, confidence, all_preds = _predict_from_pil(image)
    dt_ms = (time.time() - t0) * 1000.0

    detections = []
    if label and confidence >= CONF_THRES:
        detections.append(Detection(label=label, confidence=confidence))

    return ScoreResponse(
        success=True,
        time_ms=dt_ms,
        detections=detections,
        label=label,
        confidence=confidence,
        source="keras-mediapipe",
        bounding_box=None,
        landmarks=[],
        all_predictions=all_preds,
    )