# ISL (Indian Sign Language) Integration

This document describes the ISL integration features added to the EchoAid recognition service.

## Overview

The system now supports Indian Sign Language recognition with enhanced accuracy and dedicated scoring endpoints.

## Features Added

### 1. ISL Data Loading
- `load_isl_data()` function loads ISL datasets from JSON files in `data/isl/` directory
- Supports multiple JSON files with automatic label mapping
- Fallback to original dataset if ISL data is not available

### 2. Enhanced Training
- Updated `train.py` to prioritize ISL data over original dataset
- Automatic label consolidation across multiple ISL files
- Maintains compatibility with existing training pipeline

### 3. Improved Scoring
- Enhanced `/score` endpoint with better confidence calculation
- New `/score-isl` endpoint optimized for ISL signs
- Confidence level indicators (very_high, high, medium, low, very_low)
- ISL-specific distance thresholds and scoring algorithms

## Data Format

ISL JSON files should follow this format:

```json
{
  "labels": ["hello", "thank-you", "please", "sorry", "goodbye"],
  "samples": [
    [0.1, 0.2, 0.3, ...],  // 126-dimensional landmark vector
    [0.2, 0.3, 0.4, ...],  // Another sample
    ...
  ]
}
```

## Usage

### 1. Prepare ISL Data
Place your ISL JSON files in `data/isl/` directory.

### 2. Train the Model
```bash
python train.py
```

The system will:
- First try to load ISL data from `data/isl/` directory
- Fall back to original `data/landmarks.json` if no ISL data found
- Train the KNN model with the available data

### 3. Use the API

#### General Scoring
```bash
curl -X POST "http://localhost:8000/score" \
  -H "Content-Type: application/json" \
  -d '{
    "landmarks": [0.1, 0.2, ...],
    "isISL": true
  }'
```

#### ISL-Specific Scoring
```bash
curl -X POST "http://localhost:8000/score-isl" \
  -H "Content-Type: application/json" \
  -d '{
    "landmarks": [0.1, 0.2, ...]
  }'
```

## Response Format

```json
{
  "success": true,
  "score": 0.85,
  "label": "hello",
  "probs": [0.85, 0.10, 0.05],
  "isISL": true,
  "confidence_level": "high"
}
```

## Confidence Levels

- `very_high`: score >= 0.9
- `high`: score >= 0.8
- `medium`: score >= 0.6
- `low`: score >= 0.4
- `very_low`: score < 0.4

## Directory Structure

```
python_service/
├── data/
│   ├── isl/                    # ISL JSON files
│   │   └── sample_isl_data.json
│   └── landmarks.json          # Original dataset (fallback)
├── models/
│   └── knn.joblib             # Trained model
├── app/
│   └── main.py                # FastAPI application
├── train.py                   # Training script
└── extract_landmarks.py       # Landmark extraction
```

## Benefits

1. **Enhanced Accuracy**: ISL-specific scoring algorithms provide better recognition
2. **Flexible Data Loading**: Support for multiple ISL datasets
3. **Backward Compatibility**: Maintains support for original dataset
4. **Confidence Indicators**: Clear confidence levels for better user experience
5. **Dedicated Endpoints**: Separate scoring for ISL and general signs