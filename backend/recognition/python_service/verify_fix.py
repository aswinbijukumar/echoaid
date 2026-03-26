import requests
import os
import time

URL = "http://localhost:8001/detect"
TEST_IMAGE = "test_hand.jpg" # I'll try to find an image or just see if it handles a dummy one

def test_detect():
    print(f"Testing {URL}...")
    if not os.path.exists(TEST_IMAGE):
        # Create a dummy image if not exists
        from PIL import Image
        import numpy as np
        img = Image.fromarray(np.zeros((480, 640, 3), dtype=np.uint8))
        img.save(TEST_IMAGE)
        print(f"Created dummy image {TEST_IMAGE}")

    files = {'file': open(TEST_IMAGE, 'rb')}
    t0 = time.time()
    try:
        response = requests.post(URL, files=files)
        dt = (time.time() - t0) * 1000
        print(f"Response Status: {response.status_code}")
        print(f"Roundtrip Time: {dt:.2f}ms")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data['success']}")
            print(f"Python internal time: {data['time_ms']:.2f}ms")
            print(f"Detections: {len(data['detections'])}")
            print(f"Has landmarks: {len(data['landmarks']) > 0}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_detect()
