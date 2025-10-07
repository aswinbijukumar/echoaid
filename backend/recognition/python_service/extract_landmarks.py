"""
Extract MediaPipe hand landmarks from either a folder-per-class dataset or a YOLO dataset:
Option A (folder-per-class):
  dataset_root/
    <label>/ *.jpg|*.png
Option B (YOLO):
  dataset_root/{train,valid,test}/{images,labels} with data.yaml (names)

Outputs JSON at --out with keys: labels, samples, y
Each sample is a flattened 84-d vector (two hands × 21 landmarks × (x,y)),
normalized per-hand to its own bounding box and padded when a second hand is absent.
"""
import argparse
import json
from pathlib import Path
from typing import List, Optional, Tuple, Dict

import numpy as np
from PIL import Image


def ensure_mediapipe():
    try:
        import mediapipe as mp  # type: ignore
        return mp
    except Exception as e:
        raise RuntimeError("mediapipe is required for landmark extraction")


def extract_features_from_image(mp, image_path: Path) -> Optional[List[float]]:
    img = Image.open(image_path).convert('RGB')
    rgb = np.array(img)
    Hands = mp.solutions.hands.Hands
    with Hands(static_image_mode=True, max_num_hands=2, min_detection_confidence=0.4) as hands:
        results = hands.process(rgb)
        if not results.multi_hand_landmarks:
            return None
        hands_xy = []
        h, w = rgb.shape[:2]
        for hand_lms in results.multi_hand_landmarks[:2]:
            xs = [lm.x * w for lm in hand_lms.landmark]
            ys = [lm.y * h for lm in hand_lms.landmark]
            min_x, max_x = max(0.0, min(xs)), min(float(w), max(xs))
            min_y, max_y = max(0.0, min(ys)), min(float(h), max(ys))
            bw = max(1.0, max_x - min_x)
            bh = max(1.0, max_y - min_y)
            norm = []
            for x, y in zip(xs, ys):
                nx = (x - min_x) / bw
                ny = (y - min_y) / bh
                norm.extend([nx, ny])
            hands_xy.append(norm)
        feat: List[float] = []
        for i in range(2):
            if i < len(hands_xy):
                vals = hands_xy[i]
                if len(vals) < 42:
                    vals = vals + [0.0] * (42 - len(vals))
                feat.extend(vals[:42])
            else:
                feat.extend([0.0] * 42)
        return feat


def yolo_structure_present(root: Path) -> bool:
    return (root / "train" / "images").exists() and (root / "train" / "labels").exists() and (root / "data.yaml").exists()


def load_yolo_names(root: Path) -> Dict[int, str]:
    # Minimal YAML reader to avoid adding PyYAML dependency
    names: Dict[int, str] = {}
    try:
        txt = (root / "data.yaml").read_text(encoding="utf-8")
        in_names = False
        for line in txt.splitlines():
            s = line.strip()
            if s.startswith("names:"):
                in_names = True
                s = s[len("names:"):].strip()
                if s.startswith("[") and s.endswith("]"):
                    inner = s[1:-1]
                    parts = [p.strip().strip("'\"") for p in inner.split(",") if p.strip()]
                    for i, name in enumerate(parts):
                        names[i] = name
                    in_names = False
                continue
            if in_names and s.startswith("-"):
                # bullet list form: - class
                name = s[1:].strip().strip("'\"")
                idx = len(names)
                names[idx] = name
            elif in_names and s and not s.startswith("-"):
                # end of names block
                in_names = False
    except Exception:
        pass
    return names


def parse_yolo_label_file(label_path: Path) -> Optional[int]:
    try:
        content = label_path.read_text(encoding="utf-8").strip()
        if not content:
            return None
        first_line = content.splitlines()[0]
        cls_str = first_line.split()[0]
        return int(cls_str)
    except Exception:
        return None


def main():
    parser = argparse.ArgumentParser(description="Extract MediaPipe hand landmarks to JSON")
    parser.add_argument("dataset_root", type=str, help="Root folder with class subfolders")
    parser.add_argument("--out", type=str, default=str(Path("backend/recognition/python_service/data/landmarks.json")), help="Output JSON path")
    args = parser.parse_args()

    dataset_root = Path(args.dataset_root)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    mp = ensure_mediapipe()

    labels: List[str] = []
    samples: List[List[float]] = []
    y: List[int] = []

    if yolo_structure_present(dataset_root):
        name_map = load_yolo_names(dataset_root)
        # Build label index map
        # Maintain insertion order of names
        index_to_label: Dict[int, str] = {}
        for k in sorted(name_map.keys()):
            index_to_label[k] = name_map[k]
        for _, name in index_to_label.items():
            labels.append(name)

        splits = ["train", "valid", "test"]
        total = 0
        for split in splits:
            img_dir = dataset_root / split / "images"
            lbl_dir = dataset_root / split / "labels"
            if not img_dir.exists() or not lbl_dir.exists():
                continue
            for img_path in img_dir.glob("*.jpg"):
                label_path = lbl_dir / (img_path.stem + ".txt")
                cls_id = parse_yolo_label_file(label_path)
                if cls_id is None:
                    continue
                try:
                    feat = extract_features_from_image(mp, img_path)
                    if feat is None:
                        continue
                    samples.append(feat)
                    y.append(int(cls_id))
                    total += 1
                except Exception:
                    continue
        print(f"YOLO dataset: {total} samples across {len(labels)} classes")
    else:
        class_dirs = [p for p in dataset_root.iterdir() if p.is_dir()]
        class_dirs.sort(key=lambda p: p.name)

        for class_id, class_dir in enumerate(class_dirs):
            label = class_dir.name
            labels.append(label)
            images = []
            images.extend(class_dir.glob("*.jpg"))
            images.extend(class_dir.glob("*.jpeg"))
            images.extend(class_dir.glob("*.png"))
            processed = 0
            for img_path in images:
                try:
                    feat = extract_features_from_image(mp, img_path)
                    if feat is None:
                        continue
                    samples.append(feat)
                    y.append(class_id)
                    processed += 1
                except Exception:
                    continue
            print(f"Class {label}: {processed} samples")

    data = {
        "labels": labels,
        "samples": samples,
        "y": y
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"Saved dataset to {out_path} with {len(samples)} samples across {len(labels)} classes")


if __name__ == "__main__":
    main()

