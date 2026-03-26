import tensorflow as tf
import os

model_path = r"d:\echoaid\backend\recognition\python_service\app\model.h5"
if os.path.exists(model_path):
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded. Input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print("Model not found")
