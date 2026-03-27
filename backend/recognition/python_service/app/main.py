"""
EchoAid Python Recognition Service — Keras + MediaPipe Edition
Endpoint: POST /detect, WS /ws/recognize
Accepts: multipart/form-data with 'image' field (HTTP), JSON with 'landmarks' [63 floats] (WS)
Returns:  { detections: [{label,confidence},...], time_ms/timestamp }
"""
import os
import io
import time
import json
import logging
import traceback
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
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

# Support [label, label, ...] or {index: label} or {label: index}
if isinstance(raw, list):
    CLASS_MAP = {i: label for i, label in enumerate(raw)}
elif isinstance(raw, dict):
    # Check if keys are numeric indices (as strings)
    sample_keys = list(raw.keys())
    is_numeric = True
    # Check at most 5 samples manually to avoid slice indexing issues
    count = 0
    for k in sample_keys:
        if count >= 5: break
        if not str(k).isdigit():
            is_numeric = False
            break
        count += 1
    
    if is_numeric:
        CLASS_MAP = {int(k): v for k, v in raw.items()}
    else:
        CLASS_MAP = {v: k for k, v in raw.items()}
else:
    raise TypeError(f"Unsupported class_mapping format: {type(raw)}")

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
    logger.error(traceback.format_exc())

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
        conf_val = float(probs[idx])
        results.append({"label": label, "confidence": float(round(conf_val, 4))})
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


def process_pil_image(pil_img, t0):
    """Internal helper to process a PIL image and return Keras detections."""
    img_rgb = np.array(pil_img)
    landmarks = extract_landmarks(img_rgb)
    if landmarks is None:
        return {
            "detections": [],
            "message": "No hand detected in image",
            "time_ms": round((time.time() - t0) * 1000, 1)
        }
    detections = predict_landmarks(landmarks, top_k=5)
    return {
        "detections": detections,
        "time_ms": round((time.time() - t0) * 1000, 1),
        "landmarks_detected": True
    }


@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    t0 = time.time()
    if model is None: raise HTTPException(503, "Keras model not loaded")
    if mp_hands is None: raise HTTPException(503, "MediaPipe not available")

    contents = await image.read()
    try:
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        return process_pil_image(pil_img, t0)
    except Exception as e:
        raise HTTPException(400, f"Cannot read image: {e}")


@app.post("/detect_base64")
async def detect_base64(data: dict):
    """Accepts JSON { 'image': 'data:image/jpeg;base64,...' } for Node.js compatibility."""
    t0 = time.time()
    if model is None: raise HTTPException(503, "Keras model not loaded")
    if mp_hands is None: raise HTTPException(503, "MediaPipe not available")

    image_data = data.get("image")
    if not image_data:
        raise HTTPException(400, "Missed 'image' key in JSON")

    try:
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        import base64
        contents = base64.b64decode(image_data)
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        return process_pil_image(pil_img, t0)
    except Exception as e:
        raise HTTPException(400, f"Invalid base64 image: {e}")


@app.post("/score")
async def score(data: dict):
    """Alias for /detect_base64 to replace YOLO path seamlessly."""
    return await detect_base64(data)


@app.post("/recognize")
async def recognize(image: UploadFile = File(...)):
    """Alias for /detect — for backwards compatibility."""
    return await detect(image)


@app.websocket("/ws/recognize")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("🚀 WebSocket connection established")
    try:
        while True:
            # Expecting a JSON with a 'landmarks' key: [x1, y1, z1, ..., x21, y21, z21]
            data = await websocket.receive_json()
            landmarks_list = data.get("landmarks")
            
            if not landmarks_list or len(landmarks_list) != 63:
                # Silently ignore or send error
                continue
            
            # Predict
            landmarks = np.array(landmarks_list, dtype=np.float32)
            detections = predict_landmarks(landmarks, top_k=3)
            
            await websocket.send_json({
                "detections": detections,
                "timestamp": time.time()
            })
    except WebSocketDisconnect:
        logger.info("🔌 WebSocket disconnected")
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass