import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { extractLandmarksFromImageData, scoreLandmarks } from '../utils/recognition';
// MediaPipe removed; backend YOLO model is used for recognition

export default function SignRecognition({ 
  targetSign, 
  onRecognition, 
  onFeedback, 
  isActive = false,
  mode = 'webcam' // 'webcam' or 'upload'
}) {
  const { darkMode } = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const streamRef = useRef(null);
  // MediaPipe refs removed
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [isMediaPipeReady, setIsMediaPipeReady] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lastResultAt, setLastResultAt] = useState(0);

  // MediaPipe initialization removed

  // Initialize webcam (no MediaPipe)
  const initializeWebcam = useCallback(async () => {
    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsWebcamActive(true);
      }
    } catch (err) {
      setError('Unable to access webcam. Please check permissions.');
      console.error('Webcam error:', err);
    }
  }, []);

  // Landmark scoring removed; YOLO runs purely on images server-side

  // Landmark analysis removed

  // Direct backend image recognition
  const recognizeViaBackend = useCallback(async (imageDataUrl) => {
    try {
      setIsProcessing(true);
      setError('');
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setError('Please log in to run recognition.');
        return false;
      }
      
      // Convert data URL to blob
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('signId', targetSign._id || targetSign.id || '');
      formData.append('image', blob, 'capture.jpg');
      
      console.log('Sending recognition request...', {
        signId: targetSign._id || targetSign.id,
        imageSize: blob.size,
        apiUrl: `${API_BASE_URL}/api/practice/recognize`
      });
      
      const resp = await fetch(`${API_BASE_URL}/api/practice/recognize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        console.error('Recognition failed:', resp.status, errText);
        setError(`Image recognition failed: ${errText || resp.status}`);
        return false;
      }
      
      const data = await resp.json();
      console.log('Recognition response:', data);
      
      if (!data?.success || !data?.data) {
        console.error('Invalid response structure:', data);
        setError('Invalid response from recognition service');
        return false;
      }
      
      const attempt = data.data;
      
      // Generate landmarks based on score
      const landmarks = generateLandmarkAnalysis(attempt.score || 0);
      
      // Generate improvements based on score
      const improvements = generateImprovementsFromScore(attempt.score || 0);
      
      const result = {
        confidence: Math.round(attempt.score || 0),
        isCorrect: (attempt.score || 0) >= 75,
        feedback: attempt.feedback || generateFeedback(attempt.score || 0, targetSign),
        label: attempt.landmarks?.modelLabel || 'Unknown',
        bounding_box: attempt.landmarks?.bbox || null,
        landmarks: landmarks,
        improvements: improvements,
        modelSource: attempt.landmarks?.modelSource || 'unknown' // Add model source
      };
      
      console.log('Processed result:', result);
      setRecognitionResult(result);
      onRecognition(result);
      return true;
    } catch (e) {
      console.error('Backend recognize failed', e);
      setError(`Recognition request failed: ${e.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [targetSign, onRecognition]);

  // Generate landmarks analysis based on YOLO detection score
  const generateLandmarkAnalysis = (score) => {
    // YOLO confidence thresholds for ISL sign detection
    const highConfidence = score >= 80;  // YOLO detected with high confidence
    const mediumConfidence = score >= 50; // YOLO detected with medium confidence
    const lowConfidence = score >= 25;   // YOLO detected with low confidence
    
    return {
      handShape: highConfidence ? 'correct' : (mediumConfidence ? 'partial' : 'needs_adjustment'),
      position: highConfidence ? 'correct' : (lowConfidence ? 'partial' : 'needs_adjustment'),
      orientation: highConfidence ? 'correct' : 'needs_adjustment',
      movement: mediumConfidence ? 'correct' : 'needs_adjustment',
      timing: highConfidence ? 'correct' : 'needs_adjustment'
    };
  };

  // Generate improvements based on YOLO detection score
  const generateImprovementsFromScore = (score) => {
    const improvements = [];
    
    // YOLO-specific improvement suggestions for ISL signs
    if (score < 80) {
      improvements.push('Try to make your hand shape more clear and distinct');
    }
    if (score < 60) {
      improvements.push('Ensure your hands are fully visible in the frame');
    }
    if (score < 40) {
      improvements.push('Check your hand position and make sure it\'s centered');
    }
    if (score < 25) {
      improvements.push('Practice the basic hand shape for this ISL sign');
    }
    if (score < 15) {
      improvements.push('Make sure you are signing the correct ISL letter/sign');
      improvements.push('Try using better lighting and a plain background');
    }
    
    return improvements;
  };

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  }, []);

  // Capture frame from webcam
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Process image: send directly to backend YOLO
  const processImage = useCallback(async (imageData) => {
    setIsProcessing(true);
    try {
      const ok = await recognizeViaBackend(imageData);
      if (!ok) setError('Recognition failed.');
    } catch (err) {
      setError('Failed to process image');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [recognizeViaBackend]);
  // Generate feedback based on confidence
  const generateFeedback = (confidence, targetSign) => {
    if (confidence > 0.9) {
      return `Excellent! Your sign for "${targetSign.word}" is very accurate.`;
    } else if (confidence > 0.8) {
      return `Good job! Your sign for "${targetSign.word}" is mostly correct.`;
    } else if (confidence > 0.7) {
      return `Getting there! Your sign for "${targetSign.word}" needs some adjustments.`;
    } else {
      return `Keep practicing! Your sign for "${targetSign.word}" needs improvement.`;
    }
  };

  // Remove mock generators; improvements come from score only

  // Handle image upload
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setPreviewUrl(e.target.result);
        const useBackendImage = import.meta.env.VITE_USE_BACKEND_IMAGE === 'true';
        if (useBackendImage) {
          recognizeViaBackend(e.target.result).then((ok) => {
            if (!ok) processImage(e.target.result);
          });
        } else {
          processImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle webcam capture: send current frame to backend
  const handleWebcamCapture = () => {
    const imageData = captureFrame();
    if (imageData) {
      setPreviewUrl(imageData);
      recognizeViaBackend(imageData).then((ok) => {
        if (!ok) processImage(imageData);
      });
    }
  };

  // Auto-capture for webcam mode (hands-free, 1 fps)
  useEffect(() => {
    if (mode === 'webcam' && isWebcamActive && isActive) {
      const interval = setInterval(() => {
        if (!isProcessing) handleWebcamCapture();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [mode, isWebcamActive, isProcessing, isActive]);

  // Draw bounding box overlay when we have a result
  useEffect(() => {
    if (!recognitionResult || !overlayRef.current || !videoRef.current) return;
    const box = recognitionResult.bounding_box || recognitionResult.boundingBox || null;
    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (box && Array.isArray(box) && box.length === 4) {
      const [x1, y1, x2, y2] = box;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
  }, [recognitionResult]);

  // Initialize webcam when component mounts
  useEffect(() => {
    if (mode === 'webcam') {
      initializeWebcam();
    }
    
    return () => {
      stopWebcam();
    };
  }, [mode, initializeWebcam, stopWebcam]);

  return (
    <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl p-6 shadow-xl`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Sign Recognition</h3>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
          {mode === 'webcam' 
            ? 'Show your sign to the camera' 
            : 'Upload an image of your sign'
          }
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className={`flex items-center space-x-2 text-green-500`}>
            <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
            <span>Model Ready</span>
          </div>
          
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {mode === 'webcam' ? (
        <div className="space-y-4">
          {/* Webcam Video */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-72 object-cover rounded-xl ${
                !isWebcamActive
                  ? darkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                  : ''
              } ${darkMode ? 'ring-1 ring-gray-700' : 'ring-1 ring-gray-200'}`}
            />
            {/* Overlay for detections */}
            <canvas
              ref={overlayRef}
              className="pointer-events-none absolute inset-0 w-full h-72 rounded-xl"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isWebcamActive && (
              <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Webcam not active</p>
                </div>
              </div>
            )}
          </div>

          {/* Webcam Controls */}
          <div className="flex justify-center space-x-4">
            {!isWebcamActive ? (
              <button
                onClick={initializeWebcam}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Start Webcam
              </button>
            ) : (
              <button
                onClick={stopWebcam}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Stop Webcam
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Enhanced Image Upload with Drag & Drop */}
          <div 
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : darkMode 
                  ? 'border-gray-600 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer block"
            >
              <div className="text-4xl mb-2">📷</div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                {isDragOver ? 'Drop image here' : 'Click to upload image'}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                or drag and drop
              </p>
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Supports: JPG, PNG, GIF, WebP
              </p>
            </label>
          </div>

          {/* Image Preview with Analysis Button */}
          {previewUrl && (
            <div className="text-center space-y-4">
              {/* Preserve aspect ratio without enlarging/cropping */}
              <div className={`w-full h-72 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-xl mx-auto flex items-center justify-center ${darkMode ? 'ring-1 ring-gray-700' : 'ring-1 ring-gray-200'}`}>
                <img
                  src={previewUrl}
                  alt="Uploaded sign"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={async () => {
                    try {
                      setError('');
                      const success = await recognizeViaBackend(previewUrl);
                      if (!success) {
                        setError('Analysis failed. Please try again.');
                      }
                    } catch (err) {
                      console.error('Analysis error:', err);
                      setError('Analysis failed. Please try again.');
                    }
                  }}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Analyze Image</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setUploadedImage(null);
                    setRecognitionResult(null);
                    setError('');
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recognition Result */}
      {recognitionResult && (
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-lg ${
            recognitionResult.isCorrect 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : recognitionResult.confidence > 50
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">
                {recognitionResult.isCorrect 
                  ? '✅ Excellent!' 
                  : recognitionResult.confidence > 50
                  ? '⚠️ Good Progress!'
                  : '❌ Keep Practicing!'
                }
              </span>
              <span className="text-xl font-bold">
                {recognitionResult.confidence}% Confidence
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-medium">
                {recognitionResult.label ? `${recognitionResult.modelSource?.toUpperCase() || 'MODEL'} Detected: ${recognitionResult.label}` : `No ${recognitionResult.modelSource || 'model'} detection`}
                {targetSign?.word ? ` • Expected: ${targetSign.word}` : ''}
              </p>
              <p className="text-sm opacity-90">
                {recognitionResult.feedback}
              </p>
              {recognitionResult.bounding_box && (
                <p className="text-xs opacity-75">
                  📍 Bounding box detected at coordinates: {recognitionResult.bounding_box.map(c => Math.round(c)).join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Improvement Suggestions */}
          {recognitionResult.improvements.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Improvement Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                {recognitionResult.improvements.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* YOLO Detection Analysis */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(recognitionResult.landmarks).map(([key, value]) => (
              <div key={key} className={`p-3 rounded-lg ${
                value === 'correct' 
                  ? (darkMode ? 'bg-green-900/20' : 'bg-green-100') 
                  : value === 'partial'
                  ? (darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100')
                  : (darkMode ? 'bg-red-900/20' : 'bg-red-100')
              }`}>
                <div className="flex items-center justify-between">
                  <span className="capitalize font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={
                    value === 'correct' 
                      ? 'text-green-600' 
                      : value === 'partial'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }>
                    {value === 'correct' ? '✅' : value === 'partial' ? '⚠️' : '❌'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}