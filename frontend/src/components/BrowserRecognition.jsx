import React, { useEffect, useRef, useState } from 'react';
// Browser (ONNX) path disabled; component unused or will error if mounted.
// Remove or replace with Python /detect usage if needed.

export default function BrowserRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [fps, setFps] = useState(0);
  const [lastDetections, setLastDetections] = useState([]);

  useEffect(() => {
    let stream;
    let rafId;
    let lastTs = performance.now();

    async function setup() {
      try {
        await initYolo();
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
        loop();
      } catch (e) {
        setError(e?.message || 'Failed to start camera or load model');
      }
    }

    async function loop() {
      const now = performance.now();
      const dt = now - lastTs;
      if (dt >= 100) { // ~10 fps cap
        lastTs = now;
        try {
          const detections = await runYolo(videoRef.current);
          setLastDetections(detections);
          setFps(Math.round(1000 / dt));
          draw(detections);
        } catch (e) {
          // swallow intermittent errors during init
        }
      }
      rafId = requestAnimationFrame(loop);
    }

    function draw(dets) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.font = '14px sans-serif';
      dets.forEach(d => {
        const [x1, y1, x2, y2] = d.box;
        ctx.strokeStyle = 'rgba(99,102,241,1)';
        ctx.fillStyle = 'rgba(99,102,241,0.2)';
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.fillRect(x1, y1 - 18, ctx.measureText(d.label).width + 8, 18);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${d.label} ${(d.score*100).toFixed(1)}%`, x1 + 4, y1 - 4);
      });
    }

    setup();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-200">
          <span className="font-medium">Browser Recognition</span>
          {ready ? <span className="ml-2">(~{fps} fps)</span> : <span className="ml-2">Loading…</span>}
        </div>
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
      <div className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
        {lastDetections[0] ? `Top: ${lastDetections[0].label} (${(lastDetections[0].score*100).toFixed(1)}%)` : 'Show your hand sign to see predictions.'}
      </div>
    </div>
  );
}