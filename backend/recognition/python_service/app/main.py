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
from typing import List
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
MODEL_PATH = os.path.join(BASE_DIR, "model.keras")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(BASE_DIR, "model.h5")

model = None

def build_sign_model(num_classes):
    """
    Reconstruct EXACT architecture from model inspection:
    Dense(256,relu) -> BN -> Dropout(0.4) -> Dense(128,relu) -> BN ->
    Dropout(0.3) -> Dense(64,relu) -> Dropout(0.2) -> Dense(36,softmax)
    """
    try:
        import keras
        m = keras.Sequential([
            keras.layers.Dense(256, activation='relu', input_shape=(63,)),
            keras.layers.BatchNormalization(),
            keras.layers.Dropout(0.4),
            keras.layers.Dense(128, activation='relu'),
            keras.layers.BatchNormalization(),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(num_classes, activation='softmax')
        ])
        return m
    except Exception as e:
        logger.error(f"Failed to build model manually: {e}")
        return None

# Global MediaPipe Hands instance to avoid heavy re-initialization
hands_static = None
if mp_hands:
    try:
        hands_static = mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=2,
            min_detection_confidence=0.5
        )
        logger.info("✅ Global MediaPipe Hands (static) initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize MediaPipe Hands: {e}")

try:
    model = build_sign_model(NUM_CLASSES)
    if model:
        # Load weights from the saved model (.keras or .h5)
        # Keras 3 load_weights is very robust if architecture matches
        model.load_weights(MODEL_PATH)
        logger.info(f"✅ Keras weights loaded from {MODEL_PATH}")
        # Warm up
        dummy = np.zeros((1, 63), dtype=np.float32)
        model.predict(dummy, verbose=0)
    else:
        logger.error("❌ Model architecture build failed.")
except Exception as e:
    logger.error(f"❌ Error during manual model load: {e}")
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

def pre_process_landmark(landmark_list: List[List[float]]):
    """
    Mimics dataset_keypoint_generation.py preprocessing.
    Normalizes coordinates relative to the wrist and scales to [-1, 1].
    Expected: list of [x, y, z] for 21 points.
    """
    import copy
    temp = copy.deepcopy(list(landmark_list))
    if not temp: return np.zeros(63, dtype=np.float32)
    
    base_x, base_y, base_z = temp[0][0], temp[0][1], temp[0][2]
    
    for i in range(len(temp)):
        temp[i][0] -= base_x
        temp[i][1] -= base_y
        temp[i][2] -= base_z
        
    import itertools
    flat = list(itertools.chain.from_iterable(temp))
    
    # Calculate max absolute value for normalization
    abs_flat = [abs(v) for v in flat]
    max_val = max(abs_flat) if abs_flat else 1.0
    if max_val == 0: max_val = 1.0
    
    return np.array([v / max_val for v in flat], dtype=np.float32)


def predict_landmarks(landmarks_vector, top_k=5):
    """Run Keras model on pre-processed landmark vector."""
    if model is None:
        return []
        
    prediction = model.predict(np.array([landmarks_vector]), verbose=0)
    indices = np.argsort(prediction[0])[::-1][:top_k]
    
    results = []
    for idx in indices:
        label = CLASS_MAP.get(int(idx), str(idx))
        conf_val = float(prediction[0][idx])
        # Use string formatting to avoid round() ndigits lint issues if any
        results.append({
            "label": label, 
            "confidence": float("{:.4f}".format(conf_val))
        })
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


def process_pil_image(pil_img, t0, is_mirrored=True):
    """Internal helper to process a PIL image and return Keras detections."""
    if is_mirrored:
        # FLIP IMAGE to match training-time 'cv2.flip(img, 1)'
        pil_img = pil_img.transpose(Image.FLIP_LEFT_RIGHT)
    
    img_rgb = np.array(pil_img)
    h, w = img_rgb.shape[:2]
    
    # Extract landmarks raw
    landmarks_raw = extract_landmarks_raw(img_rgb)
    if landmarks_raw is None:
        return {
            "detections": [],
            "message": "No hand detected in image",
            "time_ms": round(float((time.time() - t0) * 1000), 1)
        }
    
    # Convert to pixel coordinates as per training script
    lm_px = []
    for lp in landmarks_raw:
        lm_px.append([lp.x * w, lp.y * h, lp.z]) # z is already relative in MP
        
    # Pre-process using the training-time algorithm
    processed_vector = pre_process_landmark(lm_px)
    
    # Run model
    detections = predict_landmarks(processed_vector, top_k=5)
    return {
        "detections": detections,
        "time_ms": round(float((time.time() - t0) * 1000), 1),
        "landmarks_detected": True
    }


def extract_landmarks_raw(image_rgb: np.ndarray):
    """Extract 21 landmark objects via MediaPipe. Returns list or None."""
    global hands_static
    if mp_hands is None or hands_static is None:
        return None
    
    try:
        result = hands_static.process(image_rgb)
        if not result.multi_hand_landmarks:
            return None
        # Return first hand detected
        return result.multi_hand_landmarks[0].landmark
    except Exception as e:
        logger.error(f"MediaPipe processing error: {e}")
        return None


@app.post("/detect")
async def detect(image: UploadFile = File(...), isMirrored: bool = True):
    t0 = time.time()
    if model is None: raise HTTPException(503, "Keras model not loaded")
    if mp_hands is None: raise HTTPException(503, "MediaPipe not available")

    contents = await image.read()
    try:
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        return process_pil_image(pil_img, t0, is_mirrored=isMirrored)
    except Exception as e:
        raise HTTPException(400, f"Cannot read image: {e}")


@app.post("/detect_base64")
async def detect_base64(data: dict):
    """Accepts JSON { 'image': 'data:image/jpeg;base64,...', 'isMirrored': true } for Node.js compatibility."""
    t0 = time.time()
    if model is None: raise HTTPException(503, "Keras model not loaded")
    if mp_hands is None: raise HTTPException(503, "MediaPipe not available")

    image_data = data.get("image")
    is_mirrored = data.get("isMirrored", True)
    if not image_data:
        raise HTTPException(400, "Missed 'image' key in JSON")

    try:
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        import base64
        contents = base64.b64decode(image_data)
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
        return process_pil_image(pil_img, t0, is_mirrored=is_mirrored)
    except Exception as e:
        raise HTTPException(400, f"Invalid base64 image: {e}")


@app.post("/score")
async def score(data: dict):
    """Alias for /detect_base64 to replace YOLO path seamlessly."""
    return await detect_base64(data)


@app.post("/recognize")
async def recognize(image: UploadFile = File(...), isMirrored: bool = True):
    """Alias for /detect — for backwards compatibility."""
    return await detect(image, isMirrored=isMirrored)


@app.websocket("/ws/recognize")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("🚀 WebSocket connection established")
    try:
        while True:
            # Expecting a JSON with a 'landmarks' key: [x1, y1, z1, ..., x21, y21, z21]
            data = await websocket.receive_json()
            landmarks_list = data.get("landmarks")
            vw = data.get("width", 640)
            is_mirrored = data.get("isMirrored", True)
            
            if not landmarks_list or len(landmarks_list) != 63:
                continue
            
            # Reshape to [21, 3]
            lm_array = []
            for i in range(0, 63, 3):
                x = landmarks_list[i]
                y = landmarks_list[i+1]
                z = landmarks_list[i+2]
                
                if x <= 1.0 and y <= 1.0 and x >= 0.0 and y >= 0.0:
                    # Legacy fallback
                    x *= 640
                    y *= 480
                
                if is_mirrored:
                    # MIRROR X to match training-time flip
                    x = vw - x
                    
                lm_array.append([x, y, z])

            # Pre-process
            processed_vector = pre_process_landmark(lm_array)
            
            # Predict
            detections = predict_landmarks(processed_vector, top_k=3)
            
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