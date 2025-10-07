"""
Train a KNN classifier for ISL sign recognition using landmark vectors.

Input format (JSON):
{
  "labels": ["hello", "thank-you", ...],
  "samples": [[f1, f2, ...], ...],
  "y": [0, 2, ...]
}

Saves a scikit-learn Pipeline to models/knn.joblib
"""
import argparse
import json
from pathlib import Path
from typing import Tuple, List, Dict

import joblib
import numpy as np
from sklearn.model_selection import StratifiedKFold, GridSearchCV, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score


def load_dataset(json_path: Path) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    labels = data.get("labels", [])
    X = np.asarray(data["samples"], dtype=float)
    y = np.asarray(data["y"], dtype=int)
    return X, y, labels


def filter_min_class_count(X: np.ndarray, y: np.ndarray, labels: List[str], min_count: int = 2) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    # Count per class
    counts: Dict[int, int] = {}
    for cls in y.tolist():
        counts[cls] = counts.get(cls, 0) + 1
    selected_classes = [cls for cls, c in counts.items() if c >= min_count]
    if len(selected_classes) == 0:
        return X, y, labels
    selected_classes.sort()
    class_old_to_new = {cls: i for i, cls in enumerate(selected_classes)}
    mask = np.isin(y, selected_classes)
    Xf = X[mask]
    yf = np.array([class_old_to_new[int(cls)] for cls in y[mask].tolist()], dtype=int)
    # Build new labels list in selected_classes order if provided
    new_labels: List[str] = []
    if labels and len(labels) > 0:
        for cls in selected_classes:
            if 0 <= cls < len(labels):
                new_labels.append(labels[cls])
            else:
                new_labels.append(str(cls))
    else:
        new_labels = [str(i) for i in range(len(selected_classes))]
    return Xf, yf, new_labels


def train_and_select_knn(X: np.ndarray, y: np.ndarray) -> Pipeline:
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("knn", KNeighborsClassifier())
    ])

    # Adjust parameters based on dataset size
    n_samples = X.shape[0]
    n_classes = len(set(y))
    
    if n_samples < 20:
        # For very small datasets, use simpler parameters and fewer CV folds
        param_grid = {
            "knn__n_neighbors": [1, 3, 5],
            "knn__weights": ["uniform", "distance"],
            "knn__metric": ["euclidean"]
        }
        cv_folds = min(3, n_samples // n_classes)
    else:
        param_grid = {
            "knn__n_neighbors": [3, 5, 7, 9, 11],
            "knn__weights": ["uniform", "distance"],
            "knn__metric": ["euclidean", "manhattan"]
        }
        cv_folds = 5

    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
    grid = GridSearchCV(
        estimator=pipeline,
        param_grid=param_grid,
        scoring="accuracy",
        n_jobs=-1,
        cv=cv,
        refit=True,
        verbose=1
    )
    grid.fit(X, y)
    print("Best params:", grid.best_params_)
    print("Best CV accuracy:", grid.best_score_)
    return grid.best_estimator_


def main():
    parser = argparse.ArgumentParser(description="Train KNN on landmark dataset")
    parser.add_argument("--data", type=str, default=str(Path("backend/recognition/python_service/data/landmarks.json")), help="Path to dataset JSON")
    parser.add_argument("--out", type=str, default=str(Path("backend/recognition/python_service/models/knn.joblib")), help="Output path for trained model")
    parser.add_argument("--report", action="store_true", help="Print classification report on a held-out split")
    args = parser.parse_args()

    data_path = Path(args.data)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    X, y, labels = load_dataset(data_path)
    print(f"Loaded dataset: X={X.shape}, y={y.shape}, classes={len(set(y))}")

    # Filter out classes with fewer than 2 samples to satisfy stratified procedures
    Xf, yf, labelsf = filter_min_class_count(X, y, labels, min_count=2)
    if Xf.shape[0] != X.shape[0]:
        removed = X.shape[0] - Xf.shape[0]
        print(f"Filtered classes with <2 samples. Removed {removed} samples. Remaining classes={len(set(yf))}, samples={Xf.shape[0]}")

    if args.report:
        try:
            X_train, X_test, y_train, y_test = train_test_split(Xf, yf, test_size=0.2, random_state=42, stratify=yf)
            model = train_and_select_knn(X_train, y_train)
            y_pred = model.predict(X_test)
            acc = accuracy_score(y_test, y_pred)
            print("Holdout accuracy:", acc)
            print(classification_report(y_test, y_pred))
        except Exception as e:
            print(f"Holdout split failed ({e}); training on all data instead.")
            model = train_and_select_knn(Xf, yf)
    else:
        model = train_and_select_knn(Xf, yf)

    joblib.dump(model, out_path)
    print(f"Saved model to {out_path}")

    # Save labels for reference
    labels_path = out_path.parent / "labels.json"
    try:
        with open(labels_path, "w", encoding="utf-8") as f:
            json.dump({"labels": labelsf}, f, ensure_ascii=False, indent=2)
        print(f"Saved labels to {labels_path}")
    except Exception as e:
        print(f"Warning: failed to save labels.json: {e}")


if __name__ == "__main__":
    main()

