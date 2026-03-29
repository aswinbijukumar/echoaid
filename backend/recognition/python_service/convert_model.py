import tensorflow as tf
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OLD_MODEL = os.path.join(BASE_DIR, "app", "model.h5")
NEW_MODEL = os.path.join(BASE_DIR, "app", "model.keras")

if os.path.exists(OLD_MODEL):
    print(f"Loading {OLD_MODEL}...")
    try:
        model = tf.keras.models.load_model(OLD_MODEL)
        print(f"Saving to {NEW_MODEL}...")
        model.save(NEW_MODEL)
        print("✅ Conversion successful!")
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
else:
    print(f"❌ Model not found at {OLD_MODEL}")
