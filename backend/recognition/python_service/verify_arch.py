import json, numpy as np, random
import tensorflow as tf

with open("app/class_mapping.json") as f:
    labels = json.load(f)
N = len(labels)
print("Classes:", N)

m = tf.keras.Sequential([
    tf.keras.layers.Dense(256, activation='relu', input_shape=(63,)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(N, activation='softmax')
])
m.load_weights("app/model.keras")
print("Model and weights loaded!")

with open("app/keypoint_3d.csv") as f:
    lines = [l.strip() for l in f if l.strip()]

samples = random.sample(lines, min(100, len(lines)))
correct = 0
for line in samples:
    parts = line.split(",")
    lbl = parts[0]
    feat = np.array([float(x) for x in parts[1:]], dtype=np.float32).reshape(1,-1)
    if feat.shape[1] != 63:
        continue
    pred_idx = int(np.argmax(m.predict(feat, verbose=0)[0]))
    if labels[pred_idx].upper() == lbl.upper():
        correct += 1

print(f"Accuracy: {correct}/100 = {correct}%")
