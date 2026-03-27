# Deployment Guide: EchoAid Python Recognition Service

Since Vercel does not support persistent WebSockets or long-running Python processes with heavy dependencies like TensorFlow, you must host the `python_service` on a platform that supports persistent servers.

## Recommended Hosting Platforms
- **Render.com** (Web Service) - *Recommended*
- **Railway.app**

## Steps to Deploy on Render

### 1. Create a New Web Service
- Connect your GitHub repository.
- Select the `backend/recognition/python_service` directory as the **Root Directory**.

### 2. Configure for Docker (Easiest & Most Reliable)
The easiest way is to use the **Dockerfile** I created:
- On Render, select **Environment: Docker**.
- It will automatically use the `Dockerfile` to install all dependencies (MediaPipe, TensorFlow, OpenCV) correctly.
- This avoids "Missing Library" errors common with manual Python setups.

### 3. Environment Variables
Add the following in the Render dashboard:
- `PORT`: `8001` (Render usually sets this automatically, but ensure uvicorn uses it).

### 4. Update Frontend (Vercel)
Once the Python service is live (e.g., `https://echoaid-python.onrender.com`), go to your **Vercel Project Settings**:
- Add `VITE_RECOGNITION_SERVICE_URL` variable.
- Value: `wss://echoaid-python.onrender.com/ws/recognize` (Note the **wss://** protocol).
- Redploy the frontend.
