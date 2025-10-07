"""
Inference module for EchoAid ISL Recognition
Handles both Roboflow YOLOv5 and local KNN models
"""
import os
from dotenv import load_dotenv
from io import BytesIO
from PIL import Image, ImageOps
import requests
import base64
from pathlib import Path
from typing import Dict, Any, Optional

# Ensure env vars from .env are loaded before accessing with os.getenv
load_dotenv()

class InferenceService:
    def __init__(self):
        self.knn_model = None
        self.knn_labels = None
        self.roboflow_api_key = os.getenv("ROBOFLOW_API_KEY", "t2CEn7l0PUbvUd1p5zRX")
        self.roboflow_model_id = os.getenv("ROBOFLOW_MODEL_ID", "isl-yolov5-xnw4l/1")
        # Tunables for Roboflow detection
        # Lower confidence picks up more candidates; backend applies its own acceptance logic
        self.rf_min_conf = float(os.getenv("RF_MIN_CONF", "0.05"))
        self.rf_overlap = float(os.getenv("RF_OVERLAP", "0.5"))
        # Test-time augmentation
        self.enable_tta = os.getenv("RF_ENABLE_TTA", "1") == "1"
        # Preprocessing
        self.enable_preproc = os.getenv("RF_ENABLE_PREPROC", "1") == "1"
        # Optional hand crop using MediaPipe Hands
        self.enable_hand_crop = os.getenv("RF_ENABLE_HAND_CROP", "1") == "1"
        self._mp_hands = None
        # Optional TensorFlow/Keras classifier
        self.enable_keras = os.getenv("KERAS_ENABLE", "0") == "1"
        self.keras_model = None
        self.keras_input_size = int(os.getenv("KERAS_INPUT_SIZE", "224"))
        self.keras_labels_path = os.getenv("KERAS_LABELS_PATH", "")
        self.keras_model_path = os.getenv("KERAS_MODEL_PATH", "")
        # Preprocessing recipe: none | mobilenet_v2 | resnet50 | efficientnet
        self.keras_preprocess = os.getenv("KERAS_PREPROCESS", "none").lower()

        self.load_knn_model()
        self._load_knn_labels()
        if self.enable_keras:
            self._load_keras_model()
    
    def load_knn_model(self):
        """Load the local KNN model (optional). Avoids importing sklearn unless file exists."""
        try:
            knn_path = Path(__file__).parent.parent / "models" / "knn.joblib"
            if not knn_path.exists():
                print(f"ℹ️  KNN model not found at {knn_path}; skipping KNN load")
                return

            # Defer heavy imports so environments without sklearn still work
            import joblib  # type: ignore
            import numpy as np  # noqa: F401  # used in predict_knn

            self.knn_model = joblib.load(knn_path)
            print(f"✅ KNN model loaded successfully from {knn_path}")
        except ImportError as e:
            print(f"ℹ️  Skipping KNN: optional dependency missing ({e})")
        except Exception as e:
            print(f"❌ Error loading KNN model: {e}")
    
    def predict_yolov5(self, image_data: str) -> Dict[str, Any]:
        """Predict using Roboflow YOLOv5 API"""
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            # Optional preprocessing (autocontrast + equalize)
            if self.enable_preproc:
                try:
                    image_bytes = self._preprocess_image_bytes(image_bytes)
                except Exception:
                    # Fail open on preprocessing
                    pass
            
            # Prepare request to Roboflow API
            url = f"https://detect.roboflow.com/{self.roboflow_model_id}"
            params = {
                "api_key": self.roboflow_api_key,
                # Use env-configured thresholds; keep relatively low to avoid missing hands
                "confidence": self.rf_min_conf,
                "overlap": self.rf_overlap
            }
            
            # Make request
            response = requests.post(url, params=params, data=image_bytes)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Roboflow API error: {response.status_code}"}
                
        except Exception as e:
            return {"error": f"YOLOv5 prediction error: {str(e)}"}

    def predict_yolov5_tta(self, image_data: str) -> Dict[str, Any]:
        """Run simple TTA (original + horizontal flip) and merge predictions by max confidence per label."""
        try:
            if not self.enable_tta:
                return self.predict_yolov5(image_data)

            # Normalize to raw bytes
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            base_bytes = base64.b64decode(image_data)

            # Prepare variants: original, flipped, rotated small angles, preprocessed versions
            variants = []
            # base original
            variants.append(base_bytes)
            # base flipped
            try:
                img = Image.open(BytesIO(base_bytes)).convert('RGB')
                flipped = ImageOps.mirror(img)
                buf = BytesIO(); flipped.save(buf, format='JPEG')
                variants.append(buf.getvalue())
                # small rotations
                for angle in (-10, -5, 5, 10):
                    try:
                        rot = img.rotate(angle, expand=True, resample=Image.BICUBIC)
                        bufr = BytesIO(); rot.save(bufr, format='JPEG')
                        variants.append(bufr.getvalue())
                    except Exception:
                        pass
            except Exception:
                pass
            # preprocessed originals
            if self.enable_preproc:
                try:
                    pre = self._preprocess_image_bytes(base_bytes)
                    variants.append(pre)
                    # preprocessed flipped
                    try:
                        imgp = Image.open(BytesIO(pre)).convert('RGB')
                        flip_p = ImageOps.mirror(imgp)
                        bufp = BytesIO(); flip_p.save(bufp, format='JPEG')
                        variants.append(bufp.getvalue())
                        # small rotations on preprocessed
                        for angle in (-10, -5, 5, 10):
                            try:
                                rotp = imgp.rotate(angle, expand=True, resample=Image.BICUBIC)
                                bufrp = BytesIO(); rotp.save(bufrp, format='JPEG')
                                variants.append(bufrp.getvalue())
                            except Exception:
                                pass
                    except Exception:
                        pass
                except Exception:
                    pass

            # Deduplicate by bytes length + first bytes signature to avoid extra calls
            seen = set()
            unique_variants = []
            for vb in variants:
                sig = (len(vb), vb[:16])
                if sig in seen:
                    continue
                seen.add(sig)
                unique_variants.append(vb)

            # Query all variants and merge
            results = []
            for vb in unique_variants:
                b64v = base64.b64encode(vb).decode('utf-8')
                results.append(self.predict_yolov5(b64v))

            # Merge by label with max confidence
            def preds(obj):
                return obj.get('predictions', []) if isinstance(obj, dict) else []
            merged = {}
            for r in results:
                for p in preds(r):
                    lbl = p.get('class_name') or p.get('class')
                    conf = float(p.get('confidence', 0.0))
                    if lbl is None:
                        continue
                    # Keep the highest confidence per label
                    if (lbl not in merged) or (conf > merged[lbl].get('confidence', 0.0)):
                        merged[lbl] = p
            return {"predictions": list(merged.values())}
        except Exception as e:
            return {"error": f"YOLOv5 TTA error: {str(e)}"}

    # ---------- Hand crop helpers ----------
    def _ensure_mediapipe(self):
        if self._mp_hands is not None:
            return True
        if not self.enable_hand_crop:
            return False
        try:
            import mediapipe as mp  # type: ignore
            self._mp_hands = mp.solutions.hands
            return True
        except Exception as e:
            print(f"ℹ️  MediaPipe not available for hand-crop: {e}")
            self.enable_hand_crop = False
            return False

    def _detect_hand_rect(self, img: Image.Image):
        if not self._ensure_mediapipe():
            return None
        import numpy as np
        Hands = self._mp_hands.Hands
        mp_drawing = self._mp_hands.drawing_utils if hasattr(self._mp_hands, 'drawing_utils') else None
        with Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.2) as hands:
            rgb = np.array(img.convert('RGB'))
            results = hands.process(rgb)
            if not results.multi_hand_landmarks:
                return None
            h, w = rgb.shape[:2]
            # Compute bounding rect over all landmarks of the most confident hand
            # MediaPipe doesn't expose scores per hand; use first hand landmarks
            all_x, all_y = [], []
            for lm in results.multi_hand_landmarks[0].landmark:
                all_x.append(int(lm.x * w))
                all_y.append(int(lm.y * h))
            x1, y1 = max(0, min(all_x)), max(0, min(all_y))
            x2, y2 = min(w, max(all_x)), min(h, max(all_y))
            # Make square with margin
            side = max(x2 - x1, y2 - y1)
            pad = int(0.25 * side)
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
            half = (side // 2) + pad
            x1, y1 = cx - half, cy - half
            x2, y2 = cx + half, cy + half
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            if x2 <= x1 or y2 <= y1:
                return None
            return (x1, y1, x2, y2)

    def predict_yolo_with_hand_crop(self, image_data: str) -> Dict[str, Any]:
        """Attempt hand detection and crop before YOLO; fallback to TTA on full frame."""
        try:
            # Normalize to base64 string
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            base_bytes = base64.b64decode(image_data)
            # Try crop
            img = Image.open(BytesIO(base_bytes)).convert('RGB')
            rect = self._detect_hand_rect(img)
            if rect:
                x1, y1, x2, y2 = rect
                crop = img.crop((x1, y1, x2, y2))
                # Safe resize to a reasonable square size to help detector consistency
                try:
                    target = 640
                    crop = crop.resize((target, target))
                except Exception:
                    pass
                buf = BytesIO(); crop.save(buf, format='JPEG')
                b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
                return self.predict_yolov5_tta(b64)
            # Fallback
            return self.predict_yolov5_tta(base64.b64encode(base_bytes).decode('utf-8'))
        except Exception as e:
            return {"error": f"hand-crop path error: {str(e)}"}
    
    def predict_knn(self, features) -> Dict[str, Any]:
        """Predict using local KNN model"""
        try:
            if self.knn_model is None:
                return {"error": "KNN model not loaded"}
            
            import numpy as np  # local import for optional dependency
            prediction = self.knn_model.predict(np.asarray(features).reshape(1, -1))
            probability = self.knn_model.predict_proba(np.asarray(features).reshape(1, -1))
            
            return {
                "prediction": prediction[0],
                "confidence": float(np.max(probability)),
                "probabilities": probability[0].tolist()
            }
        except Exception as e:
            return {"error": f"KNN prediction error: {str(e)}"}

    # ---------- Keras/TensorFlow classifier (optional) ----------
    def _load_keras_model(self):
        try:
            if not self.keras_model_path:
                print("ℹ️  KERAS_ENABLE=1 but KERAS_MODEL_PATH is empty; skipping Keras load")
                self.enable_keras = False
                return
            # Defer heavy imports
            import tensorflow as tf  # type: ignore
            self._tf = tf
            self.keras_model = tf.keras.models.load_model(self.keras_model_path)
            # Load labels if provided
            self.keras_labels = None
            if self.keras_labels_path and Path(self.keras_labels_path).exists():
                with open(self.keras_labels_path, 'r', encoding='utf-8') as f:
                    self.keras_labels = [line.strip() for line in f if line.strip()]
            print(f"✅ Keras model loaded from {self.keras_model_path}")
        except Exception as e:
            print(f"❌ Error loading Keras model: {e}")
            self.enable_keras = False

    def _preprocess_for_keras(self, image_bytes: bytes):
        try:
            from PIL import Image
            import numpy as np
            img = Image.open(BytesIO(image_bytes)).convert('RGB')
            size = (self.keras_input_size, self.keras_input_size)
            img = img.resize(size)
            arr = np.array(img).astype('float32')
            # Apply chosen preprocessing
            if self.keras_preprocess == 'mobilenet_v2':
                try:
                    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mnv2_pre
                    arr = mnv2_pre(arr)
                except Exception:
                    arr = arr / 255.0
            elif self.keras_preprocess == 'resnet50':
                try:
                    from tensorflow.keras.applications.resnet50 import preprocess_input as rn50_pre
                    arr = rn50_pre(arr)
                except Exception:
                    arr = arr / 255.0
            elif self.keras_preprocess == 'efficientnet':
                try:
                    from tensorflow.keras.applications.efficientnet import preprocess_input as eff_pre
                    arr = eff_pre(arr)
                except Exception:
                    arr = arr / 255.0
            else:
                arr = arr / 255.0
            # NHWC
            arr = arr[None, ...]
            return arr
        except Exception as e:
            raise RuntimeError(f"keras preprocess error: {e}")

    def predict_keras(self, image_data: str) -> Dict[str, Any]:
        """Predict using TensorFlow/Keras image classifier. Returns same-ish shape as YOLO path."""
        try:
            if not self.enable_keras or self.keras_model is None:
                return {"error": "Keras model not enabled or not loaded"}
            # Normalize to raw bytes
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            arr = self._preprocess_for_keras(image_bytes)
            preds = self.keras_model.predict(arr)
            import numpy as np
            probs = preds[0] if preds.ndim > 1 else preds
            idx = int(np.argmax(probs))
            conf = float(probs[idx])
            label = str(idx)
            if hasattr(self, 'keras_labels') and self.keras_labels and idx < len(self.keras_labels):
                label = self.keras_labels[idx]
            # Align to common structure used downstream
            return {"label": label, "confidence": conf, "predictions": [{"class": label, "confidence": conf}]}
        except Exception as e:
            return {"error": f"Keras prediction error: {str(e)}"}

    def predict_knn_from_image(self, image_data: str) -> Dict[str, Any]:
        """Extract landmarks using MediaPipe and classify with local KNN if available."""
        try:
            if self.knn_model is None:
                return {"error": "KNN model not loaded"}
            # Normalize to raw bytes
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            base_bytes = base64.b64decode(image_data)
            # Optional preprocessing can help detection of landmarks
            if self.enable_preproc:
                try:
                    base_bytes = self._preprocess_image_bytes(base_bytes)
                except Exception:
                    pass
            feats = self._extract_landmark_features(base_bytes)
            if feats is None:
                return {"error": "No landmarks"}
            res = self.predict_knn(feats)
            # Map integer class to label string if available
            try:
                if hasattr(self.knn_model, 'classes_'):
                    cls = res.get('prediction')
                    # classes_ could be array of strings or ints
                    res['label'] = str(cls)
                    # If the model stores string labels already, keep it
            except Exception:
                pass
            return res
        except Exception as e:
            return {"error": f"KNN image pipeline error: {str(e)}"}

    # ---------- Preprocessing ----------
    def _preprocess_image_bytes(self, image_bytes: bytes) -> bytes:
        """Lightweight preprocessing to improve contrast and normalize illumination.
        Applies autocontrast and histogram equalization, then encodes to JPEG.
        """
        try:
            img = Image.open(BytesIO(image_bytes)).convert('RGB')
            # Autocontrast first
            proc = ImageOps.autocontrast(img)
            # Then equalize per channel
            proc = ImageOps.equalize(proc)
            # If very small, upscale to at least 512px on longer side to help detector
            w, h = proc.size
            long_side = max(w, h)
            if long_side < 512:
                scale = 512.0 / float(long_side)
                nw, nh = int(w * scale), int(h * scale)
                try:
                    proc = proc.resize((nw, nh), resample=Image.BICUBIC)
                except Exception:
                    proc = proc.resize((nw, nh))
            buf = BytesIO()
            proc.save(buf, format='JPEG', quality=90)
            return buf.getvalue()
        except Exception as e:
            # On any failure, return original bytes
            return image_bytes

    def _extract_landmark_features(self, image_bytes: bytes):
        """Extract simple, normalized 2D hand landmarks (left+right), padded to fixed length.
        Returns a flat feature vector or None if no hands detected.
        """
        try:
            if not self._ensure_mediapipe():
                return None
            import numpy as np
            img = Image.open(BytesIO(image_bytes)).convert('RGB')
            rgb = np.array(img)
            Hands = self._mp_hands.Hands
            with Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.2) as hands:
                results = hands.process(rgb)
                if not results.multi_hand_landmarks:
                    return None
                # Collect up to two hands
                hands_xy = []
                h, w = rgb.shape[:2]
                for hand_lms in results.multi_hand_landmarks[:2]:
                    xs = [lm.x * w for lm in hand_lms.landmark]
                    ys = [lm.y * h for lm in hand_lms.landmark]
                    min_x, max_x = max(0.0, min(xs)), min(float(w), max(xs))
                    min_y, max_y = max(0.0, min(ys)), min(float(h), max(ys))
                    bw = max(1.0, max_x - min_x)
                    bh = max(1.0, max_y - min_y)
                    # Normalize to bounding box
                    norm = []
                    for x, y in zip(xs, ys):
                        nx = (x - min_x) / bw
                        ny = (y - min_y) / bh
                        norm.extend([nx, ny])
                    hands_xy.append(norm)
                # Ensure consistent ordering and length: two hands, each 21*2 = 42 values
                feat = []
                for i in range(2):
                    if i < len(hands_xy):
                        vals = hands_xy[i]
                        # Pad to 42 if needed
                        if len(vals) < 42:
                            vals = vals + [0.0] * (42 - len(vals))
                        feat.extend(vals[:42])
                    else:
                        feat.extend([0.0] * 42)
                return feat
        except Exception:
            return None

    def _load_knn_labels(self):
        try:
            labels_path = Path(__file__).parent.parent / "models" / "labels.json"
            if labels_path.exists():
                import json
                with open(labels_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    labels = data.get("labels")
                    if isinstance(labels, list):
                        self.knn_labels = labels
                        print(f"✅ Loaded KNN labels: {len(self.knn_labels)} classes")
        except Exception as e:
            print(f"ℹ️  Could not load KNN labels: {e}")

# Global instance
_inference_service = None

def get_model():
    """Get the inference service instance"""
    global _inference_service
    if _inference_service is None:
        _inference_service = InferenceService()
    return _inference_service