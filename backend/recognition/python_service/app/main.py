"""
EchoAid Python Recognition Service — Keras + MediaPipe Edition
Endpoint: POST /detect
Accepts: multipart/form-data with 'image' field
Returns:  { detections: [{label,confidence},...], time_ms }
"""
import os
import io
import time
import json
import logging
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="EchoAid Sign Recognition", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load class mapping ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLASS_MAP_PATH = os.path.join(BASE_DIR, "class_mapping.json")

with open(CLASS_MAP_PATH) as f:
    raw = json.load(f)

# Support both {index: label} and {label: index} formats
if all(k.isdigit() for k in list(raw.keys())[:5]):
    CLASS_MAP = {int(k): v for k, v in raw.items()}
else:
    CLASS_MAP = {v: k for k, v in raw.items()}

NUM_CLASSES = len(CLASS_MAP)
logger.info(f"Loaded {NUM_CLASSES} classes from class_mapping.json")

# ─── Load Keras model ──────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(BASE_DIR, "model.h5")
model = None

try:
    import tensorflow as tf
    model = tf.keras.models.load_model(MODEL_PATH)
    # Warm up
    dummy = np.zeros((1, 63), dtype=np.float32)
    model.predict(dummy, verbose=0)
    logger.info(f"✅ Keras model loaded: {MODEL_PATH} | input shape: {model.input_shape}")
except Exception as e:
    logger.error(f"❌ Could not load Keras model: {e}")

# ─── Load MediaPipe Hands ──────────────────────────────────────────────────────
mp_hands = None
mp_drawing = None

try:
    import mediapipe as mp
    mp_hands = mp.solutions.hands
    mp_drawing = mp.solutions.drawing_utils
    logger.info("✅ MediaPipe loaded")
except Exception as e:
    logger.error(f"❌ MediaPipe not available: {e}")


def extract_landmarks(image_rgb: np.ndarray):
    """Extract 63 (x,y,z) hand landmarks via MediaPipe. Returns flat array or None."""
    if mp_hands is None:
        return None
    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5
    ) as hands:
        result = hands.process(image_rgb)
        if not result.multi_hand_landmarks:
            return None
        lm = result.multi_hand_landmarks[0]
        flat = []
        for p in lm.landmark:
            flat.extend([p.x, p.y, p.z])
        return np.array(flat, dtype=np.float32)


def predict_landmarks(landmarks: np.ndarray, top_k: int = 5):
    """Run Keras model on landmark vector. Returns list of {label, confidence}."""
    if model is None:
        return []
    inp = landmarks.reshape(1, -1)
    probs = model.predict(inp, verbose=0)[0]
    top_indices = np.argsort(probs)[::-1][:top_k]
    results = []
    for idx in top_indices:
        label = CLASS_MAP.get(int(idx), str(idx))
        conf = float(probs[idx]) * 100
        results.append({"label": label, "confidence": round(conf, 2)})
    return results


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "mediapipe_loaded": mp_hands is not None,
        "classes": NUM_CLASSES
    }


@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    t0 = time.time()

    if model is None:
        raise HTTPException(503, "Keras model not loaded")
    if mp_hands is None:
        raise HTTPException(503, "MediaPipe not available")

    # Read image
    contents = await image.read()
    try:
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_rgb = np.array(pil_img)
    except Exception as e:
        raise HTTPException(400, f"Cannot read image: {e}")

    # Extract landmarks
    landmarks = extract_landmarks(img_rgb)
    if landmarks is None:
        return {
            "detections": [],
            "message": "No hand detected in image",
            "time_ms": round((time.time() - t0) * 1000, 1)
        }

    # Run model
    detections = predict_landmarks(landmarks, top_k=5)

    return {
        "detections": detections,
        "time_ms": round((time.time() - t0) * 1000, 1),
        "landmarks_detected": True
    }


@app.post("/recognize")
async def recognize(image: UploadFile = File(...)):
    """Alias for /detect — for backwards compatibility."""
    return await detect(image)