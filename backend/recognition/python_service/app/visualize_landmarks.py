"""
visualize_landmarks.py
--------------------------------------------------------------
Standalone script: opens webcam and draws the full 21-point
hand skeleton with X, Y, Z depth labels using MediaPipe Tasks.

Run from: d:\echoaid\backend\recognition\python_service\app\
  python visualize_landmarks.py

Press Q to quit.
--------------------------------------------------------------
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ── Connection map (MediaPipe standard HAND_CONNECTIONS) ──────────────
CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),        # thumb
    (0,5),(5,6),(6,7),(7,8),         # index
    (0,9),(9,10),(10,11),(11,12),    # middle
    (0,13),(13,14),(14,15),(15,16),  # ring
    (0,17),(17,18),(18,19),(19,20),  # pinky
    (5,9),(9,13),(13,17),            # palm knuckles
]

# Colours
BONE_CLR  = (0,  200, 0)     # green skeleton lines
JOINT_CLR = (0,  255, 255)   # yellow joint dots
LABEL_CLR = (255,255,  0)    # cyan depth labels
AXIS_CLR  = [(0,0,255),(0,255,0),(255,0,0)]  # R=x, G=y, B=z

HAND_LANDMARKER_PATH = 'hand_landmarker.task'

def draw_axis_legend(frame):
    """Small XYZ colour key in top-left corner."""
    labels = [('X (width)',  AXIS_CLR[0]),
              ('Y (height)', AXIS_CLR[1]),
              ('Z (depth)',  AXIS_CLR[2])]
    for i, (txt, clr) in enumerate(labels):
        cv2.putText(frame, txt, (10, 24 + i * 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, clr, 1, cv2.LINE_AA)

def draw_skeleton(frame, landmarks):
    h, w = frame.shape[:2]

    # 1. Draw bones
    for a, b in CONNECTIONS:
        lA, lB = landmarks[a], landmarks[b]
        pA = (int(lA.x * w), int(lA.y * h))
        pB = (int(lB.x * w), int(lB.y * h))
        cv2.line(frame, pA, pB, BONE_CLR, 2, cv2.LINE_AA)

    # 2. Draw joints + depth label
    for idx, lm in enumerate(landmarks):
        px, py = int(lm.x * w), int(lm.y * h)

        # joint circle — size based on z (closer = bigger)
        radius = max(4, int(8 - lm.z * 30))
        cv2.circle(frame, (px, py), radius, JOINT_CLR, -1, cv2.LINE_AA)
        cv2.circle(frame, (px, py), radius, (0,0,0), 1,  cv2.LINE_AA)

        # landmark index
        cv2.putText(frame, str(idx), (px + 4, py - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255,255,255), 1)

        # depth value for wrist (L0) and fingertips (4,8,12,16,20)
        if idx in {0, 4, 8, 12, 16, 20}:
            depth_txt = f"z={lm.z:.3f}"
            cv2.putText(frame, depth_txt, (px - 5, py + 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, LABEL_CLR, 1)

    # 3. Wrist origin label
    wx, wy = int(landmarks[0].x * w), int(landmarks[0].y * h)
    cv2.putText(frame, 'L0 (Origin)', (wx + 8, wy + 6),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 165, 255), 1)

def main():
    # ── Build detector ───────────────────────────────────────────────
    options = vision.HandLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=HAND_LANDMARKER_PATH),
        num_hands=1,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    detector = vision.HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    print("Press Q to quit | Press S to save a screenshot")
    shot_count = 0

    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            break

        frame = cv2.flip(frame, 1)          # mirror for natural feel
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        result = detector.detect(mp_img)

        if result.hand_landmarks:
            draw_skeleton(frame, result.hand_landmarks[0])

            # Show 63-feature count at top-right
            cv2.putText(frame, "Features: 21 x (X,Y,Z) = 63",
                        (frame.shape[1] - 280, 28),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 255), 1)
        else:
            cv2.putText(frame, "No hand detected", (20, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 200), 2)

        draw_axis_legend(frame)
        cv2.putText(frame, "EchoAid ISL — 3D Landmark Visualizer",
                    (10, frame.shape[0] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1)

        cv2.imshow("Hand Landmark Visualizer (3D)", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            fname = f"landmark_screenshot_{shot_count}.png"
            cv2.imwrite(fname, frame)
            print(f"Saved: {fname}")
            shot_count += 1

    cap.release()
    cv2.destroyAllWindows()
    detector.close()

if __name__ == '__main__':
    main()
