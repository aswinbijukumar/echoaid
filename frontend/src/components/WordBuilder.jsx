import { useState, useRef, useEffect, useCallback } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useTheme } from '../hooks/useTheme';
import {
  CheckCircleIcon,
  ArrowPathIcon,
  TrophyIcon,
  HandRaisedIcon,
  SparklesIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/* ------------------------------------------------------------------
   ISL-friendly word list  (letters that are clearly distinct in ISL)
   ------------------------------------------------------------------ */
const WORD_LIST = [
  'CAT', 'DOG', 'SUN', 'BUS', 'CUP', 'MAP', 'RUN', 'FAN',
  'HAT', 'LOG', 'MOP', 'NET', 'PIG', 'RAT', 'TUB', 'VAN',
  'WAX', 'BOX', 'LAP', 'GUM', 'HOP', 'JAM', 'KIT', 'LET',
  'MAN', 'NAP', 'OAK', 'PAD', 'RAG', 'SAP', 'TAN', 'URN',
  'HAND', 'LAMP', 'BOOK', 'CAKE', 'DOOR', 'FACE', 'GAME', 'HELP',
  'JUMP', 'KITE', 'LOCK', 'MILK', 'NOSE', 'OPEN', 'PARK', 'RICE',
  'SALT', 'TAPE', 'UNIT', 'VASE', 'WALK', 'YARN', 'ZOOM',
  'LOVE', 'CALM', 'BOLD', 'FLEX',
];

const MIN_CONFIDENCE = 50;            // minimum % to accept a letter

function getRandomWord() {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

export default function WordBuilder({ onComplete, onExit }) {
  const { darkMode } = useTheme();

  /* ── word state ── */
  const [word, setWord] = useState(() => getRandomWord());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedLetters, setCompletedLetters] = useState([]);
  const [skippedLetters, setSkippedLetters] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  /* ── webcam / recognition state ── */
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [isRecognising, setIsRecognising] = useState(false);
  const [kerasResult, setKerasResult] = useState(null);   // { label, confidence }
  const [feedback, setFeedback] = useState(null);          // 'correct' | 'wrong' | null
  const [error, setError] = useState('');
  const [isMirrored, setIsMirrored] = useState(true);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  /* ── refs ── */
  const videoRef = useRef(null);
  const canvasRef = useRef(null);   // hidden capture canvas
  const overlayRef = useRef(null);  // MediaPipe drawing overlay
  const streamRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const intervalRef = useRef(null);
  const currentIdxRef = useRef(0);
  const wordRef = useRef(word);
  const feedbackLockRef = useRef(false); // prevent double-advance
  const wsRef = useRef(null);
  const wsReadyRef = useRef(false);
  const isProcessingWsRef = useRef(false);
  const isMirroredRef = useRef(isMirrored);
  const kerasIntervalRef = useRef(null);

  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { wordRef.current = word; }, [word]);
  useEffect(() => { isMirroredRef.current = isMirrored; }, [isMirrored]);

  /* ── MediaPipe hands ── */
  const initHands = useCallback(async () => {
    if (!videoRef.current) return;
    const hands = new Hands({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    });
    hands.setOptions({
      maxNumHands: 2, // Track 2 hands for stable overlapping/occlusion
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.7,
    });
    hands.onResults((results) => {
      const multiLandmarks = results.multiHandLandmarks;
      const detected = !!(multiLandmarks?.length);
      setHandDetected(detected);

      if (detected) {
        const lm = multiLandmarks[0];
        // 1. Extract 63-dim landmark vector (x, y, z)
        const vector = [];
        const vw = videoRef.current ? (videoRef.current.videoWidth || 640) : 640;
        const vh = videoRef.current ? (videoRef.current.videoHeight || 480) : 480;
        
        lm.forEach(p => {
          vector.push(p.x * vw, p.y * vh, p.z);
        });

        // 2. Send to WebSocket ONLY if previous frame finished, to prevent lag queueing
        // 2. Send to WebSocket ONLY if previous frame finished, to prevent lag queueing
        if (wsRef.current && wsReadyRef.current && !isProcessingWsRef.current) {
          isProcessingWsRef.current = true;
          wsRef.current.send(JSON.stringify({ 
            landmarks: vector, 
            width: vw, 
            height: vh,
            isMirrored: isMirroredRef.current
          }));
          // Safety timeout (1s) to prevent WS freezing if response lost
          if (kerasIntervalRef.current) clearTimeout(kerasIntervalRef.current);
          kerasIntervalRef.current = setTimeout(() => { isProcessingWsRef.current = false; }, 1000);
        }
      }

      /* draw on overlay canvas */
      const ov = overlayRef.current;
      const vid = videoRef.current;
      if (ov && vid && vid.videoWidth) {
        if (ov.width !== vid.videoWidth || ov.height !== vid.videoHeight) {
          ov.width = vid.videoWidth;
          ov.height = vid.videoHeight;
        }
        const ctx = ov.getContext('2d');
        ctx.clearRect(0, 0, ov.width, ov.height);
        if (detected) {
          for (const lm of results.multiHandLandmarks) {
            drawConnectors(ctx, lm, HAND_CONNECTIONS, { color: '#00FF88', lineWidth: 4 });
            drawLandmarks(ctx, lm, { color: '#FF3D00', lineWidth: 2, radius: 4 });
          }
        }
      }
    });
    handsRef.current = hands;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });
    await camera.start();
    cameraRef.current = camera;
    console.log('[WordBuilder-hand] MediaPipe Hands initialized');
  }, []);

  /* ── start webcam ── */
  const startWebcam = useCallback(async (deviceId = null) => {
    try {
      setError('');
      
      const constraints = {
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : 'user'
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await new Promise((res, rej) => {
          videoRef.current.onloadedmetadata = res;
          setTimeout(() => rej(new Error('timeout')), 8000);
        });
        await videoRef.current.play();
        setIsWebcamActive(true);

        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        if (settings && settings.facingMode) {
          setIsMirrored(settings.facingMode === 'user');
        } else {
          const label = track.label.toLowerCase();
          setIsMirrored(label.includes('front') || label.includes('selfie') || label.includes('user'));
        }

        await initHands();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera error: ' + (err?.message || 'Could not access camera'));
    }
  }, [initHands]);

  /* ── enumerate cameras ── */
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating cameras:', err);
      }
    };
    getCameras();
  }, [selectedCameraId]);

  /* ── stop webcam ── */
  const stopWebcam = useCallback(() => {
    clearInterval(intervalRef.current);
    if (cameraRef.current) {
      try { cameraRef.current.stop(); } catch (_) {}
      cameraRef.current = null;
    }
    if (handsRef.current) {
      try { handsRef.current.close(); } catch (_) {}
      handsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
    if (overlayRef.current) {
      try {
        const ctx = overlayRef.current.getContext('2d');
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
      } catch (e) {
        console.warn('[WordBuilder] Error clearing canvas:', e);
      }
    }

    setHandDetected(false);
    isProcessingWsRef.current = false; // Reset lock
    if (kerasIntervalRef.current) clearTimeout(kerasIntervalRef.current);
  }, []);

  /* ── capture frame → blob ── */
  const captureBlob = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  }, []);

  /* ── advance to next letter ── */
  const advanceLetter = useCallback((skipped = false, xpEarned = 0) => {
    const idx = currentIdxRef.current;
    const w = wordRef.current;

    if (skipped) {
      setSkippedLetters(prev => [...prev, idx]);
    } else {
      setCompletedLetters(prev => [...prev, idx]);
      setTotalXP(prev => prev + xpEarned);
    }

    setKerasResult(null);
    setFeedback(null);
    feedbackLockRef.current = false;

    const next = idx + 1;
    if (next >= w.length) {
      setIsComplete(true);
      stopWebcam();
      // Notify parent on completion
      if (onComplete) {
        onComplete({
          word: w,
          totalXP: totalXP + (skipped ? 0 : xpEarned),
          completedCount: completedLetters.length + (skipped ? 0 : 1),
          skippedCount: skippedLetters.length + (skipped ? 1 : 0),
          isPerfect: skippedLetters.length + (skipped ? 1 : 0) === 0
        });
      }
    } else {
      setCurrentIdx(next);
    }
  }, [stopWebcam]);

  /* ── WebSocket Connection for real-time Keras ── */
  useEffect(() => {
    if (isWebcamActive && !isComplete) {
      const getWsUrl = () => {
        const envUrl = import.meta.env.VITE_RECOGNITION_SERVICE_URL;
        if (envUrl) return envUrl;
        
        // Smart fallback: if on localhost, use local python service port 8001
        // Otherwise, use the production Render URL
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return `ws://${window.location.hostname}:8001/ws/recognize`;
        }
        return `wss://echoaid-recognition.onrender.com/ws/recognize`;
      };

      const wsUrl = getWsUrl();
      console.log('[WordBuilder-ws] Connecting to', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WordBuilder-ws] Connected');
        wsReadyRef.current = true;
        isProcessingWsRef.current = false; // Reset lock
      };

      ws.onmessage = (event) => {
        // Clear safety timeout and unlock
        if (kerasIntervalRef.current) clearTimeout(kerasIntervalRef.current);
        isProcessingWsRef.current = false;
        
        if (feedbackLockRef.current) return;
        
        const data = JSON.parse(event.data);
        if (data.detections && data.detections.length > 0) {
          const top = data.detections[0];
          const confidencePercent = Math.round(top.confidence * 100);
          setKerasResult({ ...top, confidence: confidencePercent });

          const expected = wordRef.current[currentIdxRef.current].toUpperCase();
          if (top.label === expected && confidencePercent >= MIN_CONFIDENCE) {
            feedbackLockRef.current = true;
            setFeedback('correct');
            const xp = confidencePercent >= 90 ? 30 : confidencePercent >= 70 ? 20 : 10;
            setTimeout(() => advanceLetter(false, xp), 900);
          } else if (confidencePercent >= MIN_CONFIDENCE + 10) {
             // Show 'wrong' feedback if they sign something else clearly
             setFeedback('wrong');
             // Clear 'wrong' feedback after a short delay
             setTimeout(() => setFeedback(null), 1500);
          }
        }
      };

      ws.onclose = () => {
        console.log('[WordBuilder-ws] Disconnected');
        wsReadyRef.current = false;
      };

      return () => {
        ws.close();
        wsReadyRef.current = false;
      };
    }
  }, [isWebcamActive, isComplete, advanceLetter]);

  /* ── cleanup on unmount ── */
  useEffect(() => () => stopWebcam(), [stopWebcam]);

  /* ── new word ── */
  const newWord = useCallback(() => {
    stopWebcam();
    const w = getRandomWord();
    setWord(w);
    wordRef.current = w;
    setCurrentIdx(0);
    setCompletedLetters([]);
    setSkippedLetters([]);
    setIsComplete(false);
    setKerasResult(null);
    setFeedback(null);
    feedbackLockRef.current = false;
    setTotalXP(0);
    setError('');
    // Clear any pending feedback timeouts
    if (kerasIntervalRef.current) {
       clearTimeout(kerasIntervalRef.current);
       kerasIntervalRef.current = null;
    }
  }, [stopWebcam]);

  /* ── theme ── */
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const card = darkMode ? 'bg-[#23272F] border-gray-700' : 'bg-gray-50 border-gray-200';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';

  /* ────────────────────────────────────────────────────────────────
      COMPLETION SCREEN
  ───────────────────────────────────────────────────────────────── */
  if (isComplete) {
    const perfect = skippedLetters.length === 0;
    return (
      <div className={`flex flex-col items-center justify-center min-h-[70vh] p-6 ${text}`}>
        <div className={`${card} border rounded-2xl p-10 max-w-md w-full text-center shadow-xl`}>
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${perfect ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
            <TrophyIcon className={`w-10 h-10 ${perfect ? 'text-yellow-400' : 'text-blue-400'}`} />
          </div>
          <h2 className="text-3xl font-bold mb-2">{perfect ? '🏆 Perfect!' : '🎉 Word Complete!'}</h2>
          <p className={`${sub} mb-2`}>You spelled</p>
          <div className="flex justify-center gap-2 mb-6">
            {word.split('').map((ch, i) => (
              <span
                key={i}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl
                  ${skippedLetters.includes(i) ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
              >{ch}</span>
            ))}
          </div>

          <div className="flex justify-center gap-8 mb-8">
            <div>
              <p className="text-2xl font-bold text-yellow-400">+{totalXP}</p>
              <p className={`text-sm ${sub}`}>XP earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{completedLetters.length}/{word.length}</p>
              <p className={`text-sm ${sub}`}>Letters signed</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={newWord}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" /> New Word
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentLetter = word[currentIdx];

  /* ────────────────────────────────────────────────────────────────
      MAIN VIEW
  ───────────────────────────────────────────────────────────────── */
  return (
    <div className={`flex flex-col gap-6 ${text}`}>

      {/* Header + controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Word Builder Challenge</h2>
          <p className={`text-sm ${sub}`}>Sign each letter of the word using ISL</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={newWord}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" /> New Word
          </button>
          {onExit && (
            <button onClick={onExit} className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Word display */}
      <div className={`${card} border rounded-2xl p-6 flex flex-col items-center gap-4`}>
        <p className={`text-sm font-medium ${sub} uppercase tracking-widest`}>Current Word</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {word.split('').map((ch, i) => {
            const isDone = completedLetters.includes(i);
            const isSkipped = skippedLetters.includes(i);
            const isCurrent = i === currentIdx;
            return (
              <div
                key={i}
                className={`
                  relative w-14 h-14 flex items-center justify-center rounded-xl font-bold text-2xl
                  border-2 transition-all duration-300
                  ${isDone ? 'bg-green-500/20 border-green-500 text-green-400' :
                    isSkipped ? 'bg-red-500/15 border-red-400 text-red-400' :
                    isCurrent ? 'bg-blue-500/20 border-blue-400 text-blue-300 scale-110 shadow-lg shadow-blue-500/20' :
                    'bg-white/5 border-white/10 text-white/30'}
                `}
              >
                {ch}
                {isDone && <CheckCircleIcon className="absolute -top-2 -right-2 w-5 h-5 text-green-400" />}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs mb-1">
            <span className={sub}>{currentIdx} / {word.length} letters</span>
            <span className="text-yellow-400 font-semibold">+{totalXP} XP</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentIdx / word.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current letter + webcam */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: current letter info */}
        <div className={`${card} border rounded-2xl p-6 flex flex-col items-center justify-center gap-4`}>
          <p className={`text-sm ${sub} uppercase tracking-widest`}>Sign this letter</p>
          <div className={`
            w-28 h-28 rounded-2xl flex items-center justify-center font-bold text-6xl
            border-2 transition-all duration-300
            ${feedback === 'correct' ? 'bg-green-500/20 border-green-400 text-green-400 animate-pulse' :
              feedback === 'wrong' ? 'bg-red-500/10 border-red-400 text-red-400' :
              'bg-blue-500/10 border-blue-400 text-blue-300'}
          `}>
            {currentLetter}
          </div>

          {/* Keras result badge */}
          {kerasResult && (
            <div className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2
              ${kerasResult.label === currentLetter
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-white/60 border border-white/10'}`}>
              <SparklesIcon className="w-4 h-4" />
              AI sees: <span className="font-bold text-lg ml-1">{kerasResult.label}</span>
              <span className="text-xs opacity-70">({kerasResult.confidence}%)</span>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="flex items-center gap-2 text-green-400 font-semibold animate-bounce">
              <CheckCircleIcon className="w-5 h-5" /> Correct! Moving on…
            </div>
          )}
          {feedback === 'wrong' && kerasResult && (
            <p className={`text-xs ${sub} text-center`}>
              That looks like <strong className="text-white">{kerasResult.label}</strong> —
              try forming <strong className="text-blue-300">{currentLetter}</strong> more clearly.
            </p>
          )}
          {!kerasResult && isWebcamActive && (
            <p className={`text-xs ${sub} text-center animate-pulse`}>
              {isRecognising ? '🔍 Recognising…' : '📷 Show your hand for letter ' + currentLetter}
            </p>
          )}

          {/* Skip button */}
          {isWebcamActive && (
            <button
              onClick={() => advanceLetter(true, 0)}
              className="text-xs px-4 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors mt-2"
            >
              Skip this letter (–XP)
            </button>
          )}
        </div>

        {/* Right: webcam */}
        <div className={`${card} border rounded-2xl p-4 flex flex-col items-center gap-3 shrink-0`}>
          {error && (
            <div className="w-full text-sm text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="relative w-full h-96 bg-black rounded-xl overflow-hidden shadow-lg border border-white/10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover rounded-xl ${!isWebcamActive
                ? darkMode ? 'bg-gray-800' : 'bg-gray-200'
                : ''
                }`}
              style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
            />
            {/* MediaPipe overlay */}
            <canvas
              ref={overlayRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-xl"
              style={{ transform: isMirrored ? 'scaleX(-1)' : 'none', zIndex: 10 }}
            />
            {/* Hidden capture canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Mirroring / Hand detected indicator */}
            {isWebcamActive && (
              <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter border transition-all ${
                    isMirrored
                      ? 'bg-blue-600/80 text-white border-blue-400'
                      : 'bg-black/60 text-white/70 border-white/20'
                  }`}
                >
                  {isMirrored ? 'Mirrored' : 'Normal'}
                </button>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shadow-md
                  ${handDetected ? 'bg-green-500/80 text-white' : 'bg-black/60 text-white/60'}`}>
                  {handDetected ? (
                    <><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Hand Active</>
                  ) : (
                    "No Hand"
                  )}
                </div>
              </div>
            )}

            {!isWebcamActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 p-6 space-y-4 text-center">
                <div className="text-4xl mb-2">📹</div>
                <p className="text-white/60 font-medium">Camera Off</p>
                <p className="text-white/40 text-xs px-4">Start the camera to begin your word-building challenge.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 w-full pt-2">
            <div className="w-full max-w-[280px]">
              <label className={`text-[10px] uppercase tracking-widest ${sub} mb-1.5 block px-1`}>Video Source</label>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedCameraId(newId);
                  if (isWebcamActive) {
                    stopWebcam();
                    setTimeout(() => startWebcam(newId), 300);
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'} focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm`}
              >
                {availableCameras.length > 0 ? (
                  availableCameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
                    </option>
                  ))
                ) : (
                  <option value="">No cameras found</option>
                )}
              </select>
            </div>

            {isWebcamActive ? (
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => stopWebcam()}
                  className="px-8 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-semibold transition-all border border-red-500/20"
                >
                  Stop Camera
                </button>
                <p className={`text-[10px] ${sub} italic mt-1`}>
                  WebSocket Active · {MIN_CONFIDENCE}% Detection Min
                </p>
              </div>
            ) : (
              <button
                onClick={() => startWebcam(selectedCameraId)}
                className="flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 shadow-blue-500/25"
              >
                <PlayIcon className="w-5 h-5" /> Start Camera
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
