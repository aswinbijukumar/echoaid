from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional
import io
from PIL import Image
import base64
from pathlib import Path
import os

# Roboflow Inference SDK (new API)
from inference import get_model
from dotenv import load_dotenv

APP_ROOT = Path(__file__).resolve().parent.parent

# Load .env if present
load_dotenv()

# Config from env with fallbacks
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "t2CEn7l0PUbvUd1p5zRX")
ROBOFLOW_MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID", "isl-yolov5-xnw4l/1")
# Lower a bit to pick up close/low-contrast hands; backend will enforce its own threshold later
RF_MIN_CONF = float(os.getenv("RF_MIN_CONF", "0.05"))
RF_MAX_DETS = int(os.getenv("RF_MAX_DETS", "10"))
RF_INFER_SIZE = int(os.getenv("RF_INFER_SIZE", "640"))
# Server-side acceptance threshold for final result (prevents dummy/low-confidence outputs)
ACCEPT_CONF = float(os.getenv("RF_ACCEPT_CONF", "0.35"))
TOP_K = int(os.getenv("RF_TOP_K", "3"))

app = FastAPI(title="EchoAid ISL Recognition (Roboflow)", version="0.3.0")

class ScoreRequest(BaseModel):
	image: str = Field(..., description="Base64 encoded image (JPEG/PNG)")
	signId: Optional[str] = Field(None, description="Optional sign identifier")
	isISL: Optional[bool] = Field(True, description="Whether this is an ISL sign")

class ScoreResponse(BaseModel):
	success: bool
	score: float
	label: Optional[str] = None
	confidence: Optional[float] = None
	bounding_box: Optional[List[float]] = None
	isISL: Optional[bool] = None
	all_predictions: Optional[List[dict]] = None
	source: Optional[str] = None

class BatchScoreRequest(BaseModel):
	images: List[str] = Field(..., description="List of base64 images (JPEG/PNG)")
	signId: Optional[str] = Field(None, description="Optional sign identifier")
	isISL: Optional[bool] = Field(True, description="Whether these are ISL signs")

class BatchScoreResponse(BaseModel):
	success: bool
	label: Optional[str]
	confidence: float
	frames: int
	consensus: Optional[dict] = None

class HealthResponse(BaseModel):
	status: str
	modelReady: bool
	modelId: str

# Global model handle
rf_model = None


def load_model() -> bool:
	global rf_model
	try:
		# Use our custom inference service wrapper
		rf_model = get_model()
		return rf_model is not None
	except Exception:
		rf_model = None
		return False


@app.on_event("startup")
def on_startup():
	load_model()


@app.get("/health", response_model=HealthResponse)
def health():
	# Prefer the model id from the loaded inference service if available
	current_model_id = None
	try:
		if rf_model is not None and hasattr(rf_model, 'roboflow_model_id'):
			current_model_id = rf_model.roboflow_model_id
	except Exception:
		current_model_id = None
	return HealthResponse(status="ok", modelReady=rf_model is not None, modelId=current_model_id or ROBOFLOW_MODEL_ID)


def ensure_jpeg_bytes(image_bytes: bytes) -> bytes:
	image = Image.open(io.BytesIO(image_bytes))
	if image.mode != 'RGB':
		image = image.convert('RGB')
	buf = io.BytesIO()
	image.save(buf, format='JPEG')
	return buf.getvalue()


def normalize_predictions(result: dict) -> List[dict]:
    predictions: List[dict] = []

    def safe(obj, attr: str, key: str, default=0.0):
        if hasattr(obj, attr):
            return getattr(obj, attr)
        if isinstance(obj, dict):
            return obj.get(key, default)
        return default

    raw_preds = result.get('predictions', []) if isinstance(result, dict) else getattr(result, 'predictions', [])
    for p in raw_preds:
        # Roboflow returns center x,y and width,height in pixels
        x = float(safe(p, 'x', 'x', 0.0))
        y = float(safe(p, 'y', 'y', 0.0))
        w = float(safe(p, 'width', 'width', 0.0))
        h = float(safe(p, 'height', 'height', 0.0))
        conf = float(safe(p, 'confidence', 'confidence', 0.0))
        label = safe(p, 'class_name', 'class', None)
        x1 = x - w / 2.0
        y1 = y - h / 2.0
        x2 = x + w / 2.0
        y2 = y + h / 2.0
        predictions.append({
            'label': label,
            'confidence': conf,
            'bounding_box': [x1, y1, x2, y2]
        })
    # Filter by acceptance confidence and take top-k
    # Use much lower threshold for Keras predictions (which are typically 0.1-0.5)
    # Check if this is a Keras result by looking for class_name in predictions
    is_keras_result = (result and 'predictions' in result and len(result['predictions']) > 0 and 
                      'class_name' in result['predictions'][0])
    min_confidence = 0.05 if is_keras_result else ACCEPT_CONF
    print(f"🔍 Filtering predictions: is_keras={is_keras_result}, min_confidence={min_confidence}, predictions_count={len(predictions)}")
    
    predictions = [p for p in predictions if p['confidence'] >= min_confidence and p['label']]
    print(f"🔍 After filtering: {len(predictions)} predictions remain")
    predictions.sort(key=lambda p: p['confidence'], reverse=True)
    return predictions[:TOP_K]


@app.post("/init")
def init_model():
    """Manually initialize/refresh the model."""
    ok = load_model()
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to initialize model")
    return {"status": "ok", "modelReady": True, "modelId": ROBOFLOW_MODEL_ID}


@app.post("/score", response_model=ScoreResponse)
async def score_image(request: ScoreRequest):
    global rf_model
    if rf_model is None:
        # Lazy-load on first request to avoid cold-start races
        load_model()
    if rf_model is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    try:
        # If Keras is enabled, try it first
        result = None
        if hasattr(rf_model, 'enable_keras') and getattr(rf_model, 'enable_keras', False):
            print("🔍 Attempting Keras prediction...")
            try:
                kres = rf_model.predict_keras(request.image)
                print(f"🔍 Keras raw result: {kres}")
                if isinstance(kres, dict) and 'confidence' in kres and kres.get('confidence', 0.0) > 0.0:
                    # Map to unified predictions list with dummy bounding box for Keras
                    result = {"predictions": [{
                        "class_name": kres.get("label"), 
                        "confidence": float(kres.get("confidence", 0.0)),
                        "x": 0.5,  # Center of image
                        "y": 0.5,  # Center of image
                        "width": 1.0,  # Full width
                        "height": 1.0  # Full height
                    }]}
                    print(f"🔍 Keras mapped result: {result}")
                else:
                    print(f"🔍 Keras result rejected - confidence too low: {kres.get('confidence', 0.0)}")
            except Exception as e:
                print(f"❌ Keras prediction error: {e}")
                result = None
        else:
            print("🔍 Keras not enabled")
        # Fallback to YOLO path
        if result is None:
            # request.image is base64 (without data URL). Delegate to wrapper which calls Roboflow API.
            # Prefer hand-crop + TTA when available
            if hasattr(rf_model, 'predict_yolo_with_hand_crop'):
                result = rf_model.predict_yolo_with_hand_crop(request.image)
            else:
                result = rf_model.predict_yolov5_tta(request.image)
        preds = normalize_predictions(result)
        if not preds:
            # Fallback to MediaPipe+KNN if available
            try:
                if hasattr(rf_model, 'predict_knn_from_image'):
                    knn_res = rf_model.predict_knn_from_image(request.image)
                    if isinstance(knn_res, dict) and 'confidence' in knn_res and knn_res.get('confidence', 0.0) > 0.0:
                        return ScoreResponse(success=True, score=float(knn_res.get('confidence', 0.0)), label=str(knn_res.get('label', knn_res.get('prediction'))), confidence=float(knn_res.get('confidence', 0.0)), bounding_box=None, isISL=request.isISL, all_predictions=[], source="knn")
            except Exception:
                pass
            return ScoreResponse(success=True, score=0.0, label=None, confidence=0.0, bounding_box=None, isISL=request.isISL, all_predictions=[], source="none")
        best = max(preds, key=lambda p: p['confidence'])
        # Determine source - if we have predictions and result came from Keras, it's from Keras
        source = "keras" if (result and 'predictions' in result and hasattr(rf_model, 'enable_keras') and getattr(rf_model, 'enable_keras', False)) else "yolo"
        print(f"🔍 Final response - Source: {source}, Label: {best['label']}, Confidence: {best['confidence']}")
        return ScoreResponse(success=True, score=best['confidence'], label=best['label'], confidence=best['confidence'], bounding_box=best['bounding_box'], isISL=request.isISL, all_predictions=preds, source=source)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/score_upload", response_model=ScoreResponse)
async def score_uploaded_image(file: UploadFile = File(...), signId: Optional[str] = None):
    global rf_model
    if rf_model is None:
        load_model()
    if rf_model is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    try:
        image_data = await file.read()
        image_bytes = ensure_jpeg_bytes(image_data)
        b64 = base64.b64encode(image_bytes).decode('utf-8')
        if hasattr(rf_model, 'predict_yolo_with_hand_crop'):
            result = rf_model.predict_yolo_with_hand_crop(b64)
        else:
            result = rf_model.predict_yolov5_tta(b64)
        preds = normalize_predictions(result)
        if not preds:
            try:
                if hasattr(rf_model, 'predict_knn_from_image'):
                    knn_res = rf_model.predict_knn_from_image(b64)
                    if isinstance(knn_res, dict) and 'confidence' in knn_res and knn_res.get('confidence', 0.0) > 0.0:
                        return ScoreResponse(success=True, score=float(knn_res.get('confidence', 0.0)), label=str(knn_res.get('label', knn_res.get('prediction'))), confidence=float(knn_res.get('confidence', 0.0)), bounding_box=None, isISL=True, all_predictions=[], source="knn")
            except Exception:
                pass
            return ScoreResponse(success=True, score=0.0, label=None, confidence=0.0, bounding_box=None, isISL=True, all_predictions=[], source="none")
        best = max(preds, key=lambda p: p['confidence'])
        return ScoreResponse(success=True, score=best['confidence'], label=best['label'], confidence=best['confidence'], bounding_box=best['bounding_box'], isISL=True, all_predictions=preds, source="yolo")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/score_batch", response_model=BatchScoreResponse)
async def score_batch(request: BatchScoreRequest):
	global rf_model
	if rf_model is None:
		load_model()
	if rf_model is None:
		raise HTTPException(status_code=503, detail="Model not initialized")
	try:
		if not request.images:
			return BatchScoreResponse(success=True, label=None, confidence=0.0, frames=0, consensus={})
		# Aggregate predictions across frames
		from collections import defaultdict
		label_conf_sum = defaultdict(float)
		label_count = defaultdict(int)
		for img_b64 in request.images:
			if hasattr(rf_model, 'predict_yolo_with_hand_crop'):
				result = rf_model.predict_yolo_with_hand_crop(img_b64)
			else:
				result = rf_model.predict_yolov5_tta(img_b64)
			preds = normalize_predictions(result)
			if not preds:
				# attempt KNN fallback
				try:
					if hasattr(rf_model, 'predict_knn_from_image'):
						knn_res = rf_model.predict_knn_from_image(img_b64)
						if isinstance(knn_res, dict) and 'confidence' in knn_res and knn_res.get('confidence', 0.0) > 0.0:
							label = str(knn_res.get('label', knn_res.get('prediction')))
							conf = float(knn_res.get('confidence', 0.0))
							label_conf_sum[label] += conf
							label_count[label] += 1
				except Exception:
					pass
				continue
			# Use the best prediction for this frame
			best = max(preds, key=lambda p: p['confidence'])
			if best.get('label'):
				label = best['label']
				conf = float(best['confidence'])
				label_conf_sum[label] += conf
				label_count[label] += 1
		if not label_conf_sum:
			return BatchScoreResponse(success=True, label=None, confidence=0.0, frames=len(request.images), consensus={})
		# Choose label with highest total confidence; tie-break by count
		best_label = max(label_conf_sum.keys(), key=lambda k: (label_conf_sum[k], label_count[k]))
		total_conf = float(label_conf_sum[best_label])
		frames_used = sum(1 for _ in request.images)
		consensus = {k: {"sum_conf": float(v), "count": int(label_count[k])} for k, v in label_conf_sum.items()}
		# Normalize confidence by number of contributing frames for interpretability
		avg_conf = total_conf / max(1, label_count[best_label])
		return BatchScoreResponse(success=True, label=best_label, confidence=avg_conf, frames=frames_used, consensus=consensus)
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="0.0.0.0", port=8001)