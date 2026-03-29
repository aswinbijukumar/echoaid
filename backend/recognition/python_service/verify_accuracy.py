import os
import json
import numpy as np
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BASE_DIR, "app")
MODEL_PATH = os.path.join(APP_DIR, "model.h5")
CLASS_MAP_PATH = os.path.join(APP_DIR, "class_mapping.json")
DATA_PATH = os.path.join(APP_DIR, "keypoint_3d.csv")

def verify_model():
    print(f"Loading class mapping from {CLASS_MAP_PATH}...")
    with open(CLASS_MAP_PATH) as f:
        raw = json.load(f)
    
    if isinstance(raw, list):
        CLASS_MAP = {i: label for i, label in enumerate(raw)}
    elif isinstance(raw, dict):
        if all(k.isdigit() for k in list(raw.keys())[:5]):
            CLASS_MAP = {int(k): v for k, v in raw.items()}
        else:
            CLASS_MAP = {v: k for k, v in raw.items()}
    else:
        print("Error: Unsupported class mapping format.")
        return

    print(f"Loading model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    print(f"Reading samples from {DATA_PATH}...")
    with open(DATA_PATH, 'r') as f:
        lines = f.readlines()
    
    # Pick 20 random samples
    import random
    samples = random.sample(lines, 20)
    
    correct_top1 = 0
    correct_top3 = 0
    total = len(samples)
    
    print("\n--- Model Prediction Verification ---")
    for i, line in enumerate(samples):
        parts = line.strip().split(',')
        true_label = parts[0].upper()
        
        # Find index for this label in CLASS_MAP
        true_idx = None
        for idx, lbl in CLASS_MAP.items():
            if str(lbl).upper() == true_label:
                true_idx = idx
                break
        
        if true_idx is None:
            print(f"Warning: Label {true_label} not found in CLASS_MAP. Skipping.")
            total -= 1
            continue
            
        landmarks = np.array([float(p) for p in parts[1:]]).reshape(1, 63)
        
        probs = model.predict(landmarks, verbose=0)[0]
        top_indices = np.argsort(probs)[::-1][:3]
        
        top1_idx = top_indices[0]
        top1_label = CLASS_MAP.get(int(top1_idx), str(top1_idx))
        top1_conf = probs[top1_idx] * 100
        
        top3_labels = [CLASS_MAP.get(int(idx), str(idx)) for idx in top_indices]
        
        is_top1 = (int(top1_idx) == true_idx)
        is_top3 = (true_idx in [int(idx) for idx in top_indices])
        
        if is_top1: correct_top1 += 1
        if is_top3: correct_top3 += 1
        
        status = "✅" if is_top1 else "❌"
        print(f"Sample {i+1}: True={true_label} | Pred={top1_label} ({top1_conf:.1f}%) | Top3={top3_labels} {status}")

    print(f"\nFinal Statistics:")
    print(f"Top-1 Accuracy: {correct_top1/total*100:.1f}%")
    print(f"Top-3 Accuracy: {correct_top3/total*100:.1f}%")

if __name__ == "__main__":
    verify_model()
