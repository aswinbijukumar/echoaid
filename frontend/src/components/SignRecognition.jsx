import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { detectImageFromDataUrl } from '../utils/recognitionClient';
import { useTheme } from '../hooks/useTheme';
import SignLearningChatbot from './SignLearningChatbot';
import SignVideoTutorial from './SignVideoTutorial';
import { 
  ChatBubbleLeftRightIcon, 
  PlayIcon, 
  AcademicCapIcon,
  LightBulbIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function SignRecognition({ 
  targetSign, 
  onRecognition, 
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [handBoundingBox, setHandBoundingBox] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const wsRef = useRef(null);
  const wsReadyRef = useRef(false);
  const handsRef = useRef(null);

  // Enhanced sign dictionary with gamification elements
  const signDictionary = useMemo(() => ({
    'A': {
      name: 'Letter A',
      description: 'Make a fist with your thumb extended upward, like giving a thumbs up.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Keep your thumb straight and strong', 'Make sure other fingers are in a tight fist', 'Hold the position steady for 2 seconds'],
      commonMistakes: ['Thumb not extended enough', 'Fist too loose', 'Moving too quickly'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'B': {
      name: 'Letter B',
      description: 'Hold your hand flat with all fingers extended and thumb tucked in.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Keep all fingers straight and together', 'Tuck thumb firmly against palm', 'Hold steady like a flat surface'],
      commonMistakes: ['Fingers not straight', 'Thumb not tucked properly', 'Hand not flat enough'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'C': {
      name: 'Letter C',
      description: 'Form a C-shape with your hand, like holding a small cup.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Create a clear C-shape', 'Keep fingers curved naturally', 'Imagine holding a small cup'],
      commonMistakes: ['Shape too tight or too loose', 'Fingers not curved enough', 'Not holding the shape'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'D': {
      name: 'Letter D',
      description: 'Point your index finger upward, with other fingers in a fist.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index finger straight up', 'Other fingers in tight fist', 'Point directly upward'],
      commonMistakes: ['Index finger not straight', 'Fist not tight enough', 'Pointing at an angle'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'E': {
      name: 'Letter E',
      description: 'Hold your hand flat with all fingers extended and close together.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['All fingers straight and touching', 'Keep hand flat', 'Fingers close together'],
      commonMistakes: ['Fingers spread apart', 'Hand not flat', 'Fingers not straight'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'F': {
      name: 'Letter F',
      description: 'Touch your thumb to your index finger, other fingers extended.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Thumb touches index finger tip', 'Other fingers straight up', 'Create an F-shape'],
      commonMistakes: ['Thumb not touching properly', 'Other fingers not straight', 'Shape not clear'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'G': {
      name: 'Letter G',
      description: 'Point your index finger to the side, with other fingers in a fist.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index finger pointing sideways', 'Other fingers in tight fist', 'Point to the right'],
      commonMistakes: ['Pointing wrong direction', 'Fist not tight', 'Index finger not straight'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'H': {
      name: 'Letter H',
      description: 'Point your index and middle fingers to the side, other fingers in a fist.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index and middle fingers together', 'Point to the side', 'Other fingers in fist'],
      commonMistakes: ['Fingers not together', 'Wrong direction', 'Other fingers not in fist'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'I': {
      name: 'Letter I',
      description: 'Point your pinky finger upward, other fingers in a fist.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Pinky finger straight up', 'Other fingers in tight fist', 'Hold steady'],
      commonMistakes: ['Pinky not straight', 'Fist not tight', 'Moving too much'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'J': {
      name: 'Letter J',
      description: 'Point your pinky finger upward and trace a J-shape in the air.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Start with pinky up', 'Trace J-shape smoothly', 'End with hook to the right'],
      commonMistakes: ['Not tracing the shape', 'Movement too fast', 'Shape not clear'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'K': {
      name: 'Letter K',
      description: 'Point your index and middle fingers upward and apart, like a V.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index and middle fingers up', 'Spread them apart like V', 'Other fingers in fist'],
      commonMistakes: ['Fingers not spread enough', 'Wrong fingers', 'Not pointing up'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'L': {
      name: 'Letter L',
      description: 'Point your index finger upward, thumb extended to the side.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index finger straight up', 'Thumb out to the side', 'Create L-shape'],
      commonMistakes: ['Thumb not extended', 'Index finger not straight', 'Shape not clear'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'M': {
      name: 'Letter M',
      description: 'Hold your hand with three fingers extended and close together.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Index, middle, ring fingers up', 'Keep them close together', 'Thumb and pinky down'],
      commonMistakes: ['Wrong fingers up', 'Fingers spread apart', 'Not holding steady'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'N': {
      name: 'Letter N',
      description: 'Hold your hand with two fingers extended and close together.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Index and middle fingers up', 'Keep them close together', 'Other fingers down'],
      commonMistakes: ['Wrong fingers up', 'Fingers not together', 'Not holding steady'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'O': {
      name: 'Letter O',
      description: 'Form a circle with your thumb and index finger.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Create perfect circle', 'Thumb and index finger touching', 'Other fingers relaxed'],
      commonMistakes: ['Circle not round', 'Fingers not touching', 'Too tight or loose'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'P': {
      name: 'Letter P',
      description: 'Point your index finger downward, other fingers in a fist.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index finger pointing down', 'Other fingers in tight fist', 'Hold steady'],
      commonMistakes: ['Pointing wrong direction', 'Fist not tight', 'Index finger not straight'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'Q': {
      name: 'Letter Q',
      description: 'Point your index finger downward and to the side.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Index finger down and to side', 'Other fingers in fist', 'Point diagonally'],
      commonMistakes: ['Wrong direction', 'Fist not tight', 'Not pointing clearly'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'R': {
      name: 'Letter R',
      description: 'Cross your index and middle fingers.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Cross index over middle finger', 'Other fingers relaxed', 'Hold the cross steady'],
      commonMistakes: ['Not crossing properly', 'Fingers not touching', 'Moving too much'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'S': {
      name: 'Letter S',
      description: 'Make a fist with your thumb on top of your fingers.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Make tight fist', 'Thumb on top of fingers', 'Hold steady'],
      commonMistakes: ['Fist not tight', 'Thumb not on top', 'Moving too much'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'T': {
      name: 'Letter T',
      description: 'Hold your hand flat with thumb tucked under fingers.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Hand flat', 'Thumb tucked under fingers', 'Keep steady'],
      commonMistakes: ['Hand not flat', 'Thumb not tucked', 'Moving too much'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'U': {
      name: 'Letter U',
      description: 'Point your index and middle fingers upward, close together.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index and middle fingers up', 'Keep them close together', 'Other fingers down'],
      commonMistakes: ['Fingers not together', 'Wrong fingers up', 'Not pointing up'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'V': {
      name: 'Letter V',
      description: 'Point your index and middle fingers upward and apart.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Index and middle fingers up', 'Spread them apart', 'Create V-shape'],
      commonMistakes: ['Fingers not spread', 'Wrong fingers', 'Not pointing up'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'W': {
      name: 'Letter W',
      description: 'Point your index, middle, and ring fingers upward and apart.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Three fingers up and spread', 'Index, middle, ring fingers', 'Create W-shape'],
      commonMistakes: ['Wrong fingers up', 'Not spread enough', 'Not holding steady'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'X': {
      name: 'Letter X',
      description: 'Cross your index and middle fingers.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Cross index over middle finger', 'Other fingers relaxed', 'Hold the cross steady'],
      commonMistakes: ['Not crossing properly', 'Fingers not touching', 'Moving too much'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'Y': {
      name: 'Letter Y',
      description: 'Point your thumb and pinky finger outward, other fingers in a fist.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Thumb and pinky out', 'Other fingers in fist', 'Create Y-shape'],
      commonMistakes: ['Wrong fingers out', 'Fist not tight', 'Not holding steady'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'Z': {
      name: 'Letter Z',
      description: 'Point your index finger and trace a Z-shape in the air.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Start with index finger', 'Trace Z-shape smoothly', 'Horizontal, diagonal, horizontal'],
      commonMistakes: ['Not tracing the shape', 'Movement too fast', 'Shape not clear'],
      learningLevel: 'Mastering',
      xpValue: 20
    },
    '0': {
      name: 'Number 0',
      description: 'Form a circle with your thumb and index finger.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Create perfect circle', 'Thumb and index finger touching', 'Other fingers relaxed'],
      commonMistakes: ['Circle not round', 'Fingers not touching', 'Too tight or loose'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '1': {
      name: 'Number 1',
      description: 'Point your index finger upward, other fingers in a fist.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Index finger straight up', 'Other fingers in tight fist', 'Point directly upward'],
      commonMistakes: ['Index finger not straight', 'Fist not tight enough', 'Pointing at an angle'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '2': {
      name: 'Number 2',
      description: 'Point your index and middle fingers upward and apart.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Index and middle fingers up', 'Spread them apart', 'Create V-shape'],
      commonMistakes: ['Fingers not spread', 'Wrong fingers', 'Not pointing up'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '3': {
      name: 'Number 3',
      description: 'Point your index, middle, and ring fingers upward and apart.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Three fingers up and spread', 'Index, middle, ring fingers', 'Create W-shape'],
      commonMistakes: ['Wrong fingers up', 'Not spread enough', 'Not holding steady'],
      learningLevel: 'Building',
      xpValue: 15
    },
    '4': {
      name: 'Number 4',
      description: 'Point your index, middle, ring, and pinky fingers upward and apart.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Four fingers up and spread', 'All fingers except thumb', 'Keep them spread apart'],
      commonMistakes: ['Wrong fingers up', 'Not spread enough', 'Thumb not down'],
      learningLevel: 'Building',
      xpValue: 15
    },
    '5': {
      name: 'Number 5',
      description: 'Hold your hand flat with all fingers extended and apart.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['All fingers straight and spread', 'Keep hand flat', 'Fingers apart'],
      commonMistakes: ['Fingers not spread', 'Hand not flat', 'Fingers not straight'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '6': {
      name: 'Number 6',
      description: 'Touch your thumb to your pinky finger, other fingers extended.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Thumb touches pinky', 'Other fingers straight up', 'Create 6-shape'],
      commonMistakes: ['Thumb not touching pinky', 'Other fingers not straight', 'Shape not clear'],
      learningLevel: 'Building',
      xpValue: 15
    },
    '7': {
      name: 'Number 7',
      description: 'Touch your thumb to your ring finger, other fingers extended.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Thumb touches ring finger', 'Other fingers straight up', 'Create 7-shape'],
      commonMistakes: ['Thumb not touching ring finger', 'Other fingers not straight', 'Shape not clear'],
      learningLevel: 'Building',
      xpValue: 15
    },
    '8': {
      name: 'Number 8',
      description: 'Touch your thumb to your middle finger, other fingers extended.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Thumb touches middle finger', 'Other fingers straight up', 'Create 8-shape'],
      commonMistakes: ['Thumb not touching middle finger', 'Other fingers not straight', 'Shape not clear'],
      learningLevel: 'Building',
      xpValue: 15
    },
    '9': {
      name: 'Number 9',
      description: 'Touch your thumb to your index finger, other fingers extended.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Thumb touches index finger', 'Other fingers straight up', 'Create 9-shape'],
      commonMistakes: ['Thumb not touching index finger', 'Other fingers not straight', 'Shape not clear'],
      learningLevel: 'Foundation',
      xpValue: 10
    }
  }), []);

  // Gamified feedback generation functions
  const generateGamifiedFeedback = (detection, expected, confidence, signInfo) => {
    if (!detection) {
      return "🎯 No sign detected! Try making your hand more visible and clear.";
    }

    const isCorrect = expected && detection.label.toUpperCase() === expected.toUpperCase();
    
    if (isCorrect) {
      if (confidence >= 90) {
        return `🏆 PERFECT! You mastered the ${signInfo?.name || detection.label}!`;
      } else if (confidence >= 70) {
        return `⭐ Great job! You got the ${signInfo?.name || detection.label} right!`;
      } else {
        return `✅ Good! You're learning the ${signInfo?.name || detection.label}!`;
      }
    } else {
      if (expected) {
        return `🎯 You made ${detection.label}, but we're practicing ${expected}. Keep trying!`;
      } else {
        return `🤔 I see ${detection.label}! ${confidence >= 50 ? 'Nice work!' : 'Try to make it clearer!'}`;
      }
    }
  };

  const generateImprovementTips = (detection, expected, signInfo, expectedSignInfo) => {
    const tips = [];
    
    if (expected && detection?.label.toUpperCase() !== expected.toUpperCase()) {
      // Wrong sign detected
      if (expectedSignInfo?.tips) {
        tips.push(`💡 For ${expected}: ${expectedSignInfo.tips[0]}`);
      }
      if (expectedSignInfo?.commonMistakes) {
        tips.push(`⚠️ Avoid: ${expectedSignInfo.commonMistakes[0]}`);
      }
    } else if (detection && signInfo) {
      // Correct sign or no expected sign
      if (signInfo.tips) {
        tips.push(`💡 Pro tip: ${signInfo.tips[0]}`);
      }
    }
    
    // General tips based on confidence
    if (detection?.confidence < 0.5) {
      tips.push("🔍 Make sure your hand is clearly visible and well-lit");
      tips.push("⏱️ Hold the sign steady for 2-3 seconds");
    }
    
    return tips;
  };

  const generateAchievement = (confidence) => {
    if (confidence >= 95) {
      return "🏆 Legendary Master!";
    } else if (confidence >= 90) {
      return "⭐ Sign Master!";
    } else if (confidence >= 80) {
      return "🎯 Excellent!";
    } else if (confidence >= 70) {
      return "👍 Good Job!";
    } else if (confidence >= 50) {
      return "📈 Keep Improving!";
    } else {
      return "💪 Practice Makes Perfect!";
    }
  };

  const calculateXP = (confidence, isCorrect, signInfo) => {
    if (!isCorrect) return 0;
    
    let baseXP = signInfo?.xpValue || 10;
    
    // Bonus XP for high confidence
    if (confidence >= 95) return baseXP * 3; // 3x bonus
    if (confidence >= 90) return baseXP * 2; // 2x bonus
    if (confidence >= 80) return Math.round(baseXP * 1.5); // 1.5x bonus
    if (confidence >= 70) return baseXP; // Base XP
    if (confidence >= 50) return Math.round(baseXP * 0.5); // Half XP
    
    return 0; // No XP for low confidence
  };

  const getLearningProgress = (confidence, isCorrect) => {
    if (isCorrect) {
      if (confidence >= 90) return { level: 'Master', color: 'text-purple-600', icon: '🏆' };
      if (confidence >= 70) return { level: 'Advanced', color: 'text-blue-600', icon: '⭐' };
      if (confidence >= 50) return { level: 'Intermediate', color: 'text-green-600', icon: '👍' };
      return { level: 'Learning', color: 'text-yellow-600', icon: '📚' };
    }
    return { level: 'Practice', color: 'text-orange-600', icon: '🔄' };
  };

  const generateEncouragement = (confidence) => {
    const encouragements = [
      "You're doing great! 🌟",
      "Every sign you learn is progress! 📚",
      "Keep practicing, you're getting better! 💪",
      "Sign language is a beautiful skill! 🤟",
      "You're building an amazing ability! 🎯",
      "Every attempt teaches you something! 📖",
      "You're becoming a sign language champion! 🏆",
      "Practice makes perfect! Keep going! ⭐"
    ];
    
    if (confidence >= 80) {
      return encouragements[0]; // "You're doing great! 🌟"
    } else if (confidence >= 60) {
      return encouragements[2]; // "Keep practicing, you're getting better! 💪"
    } else {
      return encouragements[7]; // "Practice makes perfect! Keep going! ⭐"
    }
  };

  // Compute expected label from the selected sign word (first alphanumeric uppercased)
  const getExpectedLabel = useCallback(() => {
    const word = targetSign?.word || '';
    const match = (word.match(/[A-Za-z0-9]/) || [null])[0];
    return match ? match.toUpperCase() : null;
  }, [targetSign]);

  // MediaPipe initialization removed

  // Initialize MediaPipe Hands
  const initializeHands = useCallback(async () => {
    try {
      const { Hands } = await import('@mediapipe/hands');
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });
      
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const video = videoRef.current;
          
          if (video && video.videoWidth > 0 && video.videoHeight > 0) {
            // Calculate hand bounding box from landmarks
            const xCoords = landmarks.map(landmark => landmark.x * video.videoWidth);
            const yCoords = landmarks.map(landmark => landmark.y * video.videoHeight);
            
            const minX = Math.min(...xCoords);
            const maxX = Math.max(...xCoords);
            const minY = Math.min(...yCoords);
            const maxY = Math.max(...yCoords);
            
            // Add padding around the hand (increased for better detection)
            const padding = 80;
            const width = maxX - minX + (padding * 2);
            const height = maxY - minY + (padding * 2);
            
            // Ensure minimum size for better detection
            const minSize = 200;
            const finalWidth = Math.max(minSize, width);
            const finalHeight = Math.max(minSize, height);
            
            const boundingBox = {
              x: Math.max(0, Math.min(minX - padding, video.videoWidth - finalWidth)),
              y: Math.max(0, Math.min(minY - padding, video.videoHeight - finalHeight)),
              width: Math.min(video.videoWidth, finalWidth),
              height: Math.min(video.videoHeight, finalHeight)
            };
            
            setHandBoundingBox(boundingBox);
            setHandDetected(true);
            console.log('[hand] Hand detected, bounding box:', boundingBox);
          }
        } else {
          setHandDetected(false);
          setHandBoundingBox(null);
        }
      });
      
      handsRef.current = hands;
      console.log('[hand] MediaPipe Hands initialized');
    } catch (error) {
      console.error('[hand] Failed to initialize MediaPipe Hands:', error);
    }
  }, []);

  // Enumerate available cameras
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      setAvailableCameras(cameras);
      if (cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(cameras[0].deviceId);
      }
      console.log('[camera] Available cameras:', cameras);
    } catch (err) {
      console.error('[camera] Failed to enumerate cameras:', err);
    }
  }, [selectedCameraId]);

  // Initialize webcam (no MediaPipe)
  const initializeWebcam = useCallback(async () => {
    try {
      setError('');
      setIsWebcamActive(false);
      
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('Camera API not available in this browser. Please use a modern browser.');
        return;
      }

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Enumerate cameras first
      await enumerateCameras();

      console.log('[camera] Requesting camera access...', { selectedCameraId });
      
      const constraints = {
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          ...(selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { facingMode: 'user' })
        },
        audio: false
      };

      // Add timeout to getUserMedia
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Camera access timeout after 10 seconds')), 10000)
        )
      ]);

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        const video = videoRef.current;
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            console.log('[camera] Video loaded', { 
              width: video.videoWidth, 
              height: video.videoHeight,
              stream: !!stream,
              tracks: stream.getTracks().length
            });
            resolve();
          };
          video.onerror = reject;
          setTimeout(() => reject(new Error('Video load timeout')), 5000);
        });

        // Play video
        try {
          await video.play();
        setIsWebcamActive(true);
          setIsVideoReady(true);
          
          // Initialize hand detection
          await initializeHands();
          
          console.log('[camera] Camera started successfully');
        } catch (playError) {
          console.error('[camera] Play error:', playError);
          setError('Camera started but autoplay blocked. Please interact with the page.');
          setIsWebcamActive(true); // Still consider it active
          setIsVideoReady(true);
          
          // Initialize hand detection even if autoplay is blocked
          await initializeHands();
        }
      }
    } catch (err) {
      console.error('[camera] Error:', err);
      const name = err?.name || '';
      let message = 'Unable to access webcam. ';
      
      if (name === 'NotAllowedError') {
        message = 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
      } else if (name === 'NotFoundError') {
        message = 'No camera found. Please connect a camera and try again.';
      } else if (name === 'NotReadableError') {
        message = 'Camera is being used by another application. Please close other apps and try again.';
      } else if (name === 'OverconstrainedError' || err.message.includes('timeout')) {
        message = 'Camera timeout or constraints not supported. Trying with basic settings...';
        // Try with minimal constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ 
            video: { deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined },
            audio: false 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            streamRef.current = basicStream;
            setIsWebcamActive(true);
            console.log('[camera] Started with basic constraints');
            return;
          }
        } catch (basicErr) {
          console.error('[camera] Basic constraints also failed:', basicErr);
          message = 'Camera failed to start. Please check if another app is using the camera or try a different camera.';
        }
      }
      
      setError(message);
      setIsWebcamActive(false);
    }
  }, [selectedCameraId, enumerateCameras, initializeHands]);

  // Initialize WebSocket to Python realtime endpoint
  const openWebSocket = useCallback(() => {
    // WebSocket disabled: Python service does not expose ws endpoint. Using HTTP /detect.
    wsReadyRef.current = false;
  }, []);

  // Landmark scoring removed; MediaPipe + model.h5 runs purely on images server-side

  // Landmark analysis removed

  // Direct Python YOLOv5 image recognition
  const recognizeViaBackend = useCallback(async (imageDataUrl) => {
    try {
      setIsProcessing(true);
      setError('');
      
      console.log('[recognition] Starting detection for image:', imageDataUrl?.substring(0, 50) + '...');
      
      // Use the new data URL function
      const data = await detectImageFromDataUrl(imageDataUrl);
      const expected = getExpectedLabel();
      
      // Map YOLO detections to a single result for session scoring
      const top = Array.isArray(data?.detections) && data.detections.length ? data.detections[0] : null;
      const confidencePercent = Math.round(((top?.confidence) || 0) * 100);
      
      console.log('[recognition] Raw detection data:', {
        detections: data?.detections?.length || 0,
        top: top,
        confidence: top?.confidence,
        confidencePercent: confidencePercent
      });
      
      // Validate result legitimacy with stricter criteria
      const isValidResult = top && top.confidence > 0.25; // Increased minimum confidence to 25%
      const isLegitimateSign = top && signDictionary[top.label]; // Must be a known sign
      
      // Additional validation: check if the detection makes sense
      const isReasonableDetection = top && top.confidence > 0.4; // Higher threshold for "reasonable" detections
      
      // Generate gamified feedback
      const signInfo = signDictionary[top?.label] || null;
      const expectedSignInfo = expected ? signDictionary[expected] : null;
      const isCorrect = expected ? ((top?.label || '').toUpperCase() === expected) : isReasonableDetection;
      const learningProgress = getLearningProgress(confidencePercent, isCorrect);
      
      const result = {
        confidence: confidencePercent,
        isCorrect: isCorrect,
        feedback: generateGamifiedFeedback(top, expected, confidencePercent, signInfo),
        label: (isValidResult && isLegitimateSign) ? top.label : 'Unknown',
        bounding_box: top?.box || null,
        landmarks: null,
        improvements: generateImprovementTips(top, expected, signInfo, expectedSignInfo),
        modelSource: 'yolov5',
        isValid: isValidResult && isLegitimateSign,
        confidenceLevel: confidencePercent >= 90 ? 'excellent' : 
                        confidencePercent >= 70 ? 'good' : 
                        confidencePercent >= 50 ? 'fair' : 'poor',
        isReasonable: isReasonableDetection,
        // Enhanced gamification elements
        xpEarned: calculateXP(confidencePercent, isCorrect, signInfo),
        difficulty: signInfo?.difficulty || 'Unknown',
        category: signInfo?.category || 'Unknown',
        learningLevel: learningProgress.level,
        learningIcon: learningProgress.icon,
        learningColor: learningProgress.color,
        achievement: generateAchievement(confidencePercent),
        encouragement: generateEncouragement(confidencePercent),
        // Educational elements
        signName: signInfo?.name || top?.label || 'Unknown',
        signDescription: signInfo?.description || '',
        signUsage: signInfo?.usage || '',
        signTips: signInfo?.tips || [],
        commonMistakes: signInfo?.commonMistakes || []
      };
      
      console.log('[recognition] Processed result:', result);
      setRecognitionResult(result);
      onRecognition(result);
      return true;
    } catch (e) {
      console.error('[recognition] Backend recognize failed', e);
      setError(`Recognition request failed: ${e.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [onRecognition, getExpectedLabel, signDictionary]);

  // Removed synthetic landmark analysis and tips; we show pure model output

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
    setIsVideoReady(false);
  }, []);

  // Capture frame from webcam with optional cropping
  const captureFrame = useCallback((cropArea = null) => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // If no crop area specified, capture full frame
    if (!cropArea) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    } else {
      // Crop to the specified area
      const { x, y, width, height } = cropArea;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
    }
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Define detection area - use hand bounding box if available, otherwise fallback to center
  const getDetectionArea = useCallback(() => {
    if (!videoRef.current) return null;
    
    const video = videoRef.current;
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    // If hand is detected, use hand bounding box
    if (handDetected && handBoundingBox) {
      console.log('[detection] Using hand bounding box:', handBoundingBox);
      return handBoundingBox;
    }
    
    // Fallback to centered area if no hand detected
    const size = Math.min(videoWidth, videoHeight) * 0.6;
    const x = (videoWidth - size) / 2;
    const y = (videoHeight - size) / 2;
    
    console.log('[detection] Using fallback centered area:', { x, y, width: size, height: size });
    return { x, y, width: size, height: size };
  }, [handDetected, handBoundingBox]);

  // Send frame over WebSocket if available; fallback to HTTP
  const sendFrameRealtime = useCallback((imageDataUrl) => {
    const payload = { type: 'frame', image: imageDataUrl };
    if (wsRef.current && wsReadyRef.current) {
      try { 
        wsRef.current.send(JSON.stringify(payload)); 
        return true; 
      } catch (error) {
        console.warn('WebSocket send error:', error);
      }
    }
    return false;
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

  // Remove mock generators; improvements come from score only

  // Handle image upload
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      console.log('[upload] Processing file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        // setUploadedImage(dataUrl);
        setPreviewUrl(dataUrl);
        
        // Always use backend recognition for uploads
        console.log('[upload] Starting recognition for uploaded image');
        recognizeViaBackend(dataUrl).then((ok) => {
          if (!ok) {
            console.error('[upload] Recognition failed');
            setError('Recognition failed for uploaded image');
          }
        }).catch(err => {
          console.error('[upload] Recognition error:', err);
          setError('Recognition error: ' + err.message);
        });
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
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

  // Process video frame for hand detection
  const processVideoFrame = useCallback(async () => {
    const video = videoRef.current;
    const hands = handsRef.current;
    
    if (!video || !hands || video.readyState < 2) return;
    
    try {
      await hands.send({ image: video });
    } catch (error) {
      console.error('[hand] Error processing frame:', error);
    }
  }, []);

  // Handle webcam capture: send cropped detection area to backend
  const handleWebcamCapture = useCallback(() => {
    // Check if video is ready and has valid dimensions
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('[realtime] Video not ready yet, skipping capture');
      return;
    }
    
    // Process frame for hand detection first
    processVideoFrame();
    
    const detectionArea = getDetectionArea();
    if (!detectionArea) {
      console.log('[realtime] No detection area available');
      return;
    }
    
    console.log('[realtime] Capturing frame from detection area:', detectionArea);
    
    // Capture only the detection area (hand or fallback)
    const imageData = captureFrame(detectionArea);
    if (imageData) {
      setPreviewUrl(imageData);
      console.log('[realtime] Frame captured, length:', imageData.length);
      
      // Try WebSocket first, then fallback to HTTP
      const sent = sendFrameRealtime(imageData);
      if (!sent) {
        console.log('[realtime] Using HTTP recognition');
        recognizeViaBackend(imageData).then((ok) => {
          console.log('[realtime] Recognition result:', ok);
          if (!ok) {
            console.log('[realtime] Trying processImage fallback');
            processImage(imageData);
          }
        }).catch(err => {
          console.error('[realtime] HTTP recognition error:', err);
          setError('Real-time recognition failed: ' + err.message);
        });
      }
    } else {
      console.log('[realtime] Failed to capture frame');
      setError('Failed to capture frame from webcam');
    }
  }, [getDetectionArea, captureFrame, sendFrameRealtime, recognizeViaBackend, processImage, setError, processVideoFrame]);

  // Auto-capture for webcam mode (hands-free, 1 fps)
  useEffect(() => {
    if (mode === 'webcam' && isWebcamActive && isVideoReady) {
      console.log('[realtime] Starting auto-capture interval');
      const interval = setInterval(() => {
        if (!isProcessing) {
          handleWebcamCapture();
        }
      }, 1000);

      return () => {
        console.log('[realtime] Clearing auto-capture interval');
        clearInterval(interval);
      };
    }
  }, [mode, isWebcamActive, isVideoReady, isProcessing, handleWebcamCapture]);

  // Draw detection area and results overlay
  useEffect(() => {
    if (!overlayRef.current || !videoRef.current) return;
    
    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw hand detection area
    const detectionArea = getDetectionArea();
    if (detectionArea) {
      const { x, y, width, height } = detectionArea;
      
      if (handDetected && handBoundingBox) {
        // Draw hand detection area in green
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        
        // Add label
        ctx.fillStyle = '#22c55e';
        ctx.font = '14px Arial';
        ctx.fillText('Hand Detected', x + 5, y - 5);
      } else {
        // Draw fallback area in orange
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        
        // Add label
        ctx.fillStyle = '#f59e0b';
        ctx.font = '12px Arial';
        ctx.fillText('Detection Area', x + 5, y - 5);
      }
    }
    
    // Don't draw YOLOv5 results on overlay since they're in cropped space
    // Results are shown in the UI below the video instead
  }, [recognitionResult, getDetectionArea, handDetected, handBoundingBox]);

  // Initialize webcam when component mounts
  useEffect(() => {
    if (mode === 'webcam') {
      initializeWebcam();
      openWebSocket();
    }
    
    return () => {
      stopWebcam();
      const ws = wsRef.current;
      if (ws) {
        try { 
          ws.close(); 
        } catch (error) {
          console.warn('WebSocket close error:', error);
        }
      }
    };
  }, [mode, initializeWebcam, stopWebcam, openWebSocket]);

  return (
    <div className="w-full">
      {/* Header Section - Matching Dashboard Theme */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Sign Recognition Practice</h3>
            <p className="text-blue-100">
              {mode === 'webcam' 
                ? 'Show your sign to the camera for real-time recognition' 
                : 'Upload an image to recognize the sign'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChatbot(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Get Help</span>
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <AcademicCapIcon className="w-5 h-5" />
              <span>Tutorial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <div className={`flex items-center space-x-2 text-green-500`}>
          <div className={`w-3 h-3 rounded-full bg-green-500`}></div>
          <span className="font-medium">Model Ready</span>
        </div>
        {mode === 'webcam' && isWebcamActive && isVideoReady && (
          <div className={`flex items-center space-x-2 ${isProcessing ? 'text-blue-500' : handDetected ? 'text-green-500' : 'text-yellow-500'}`}>
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : handDetected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            <span className="font-medium">{isProcessing ? 'Analyzing...' : handDetected ? 'Hand Detected' : 'Looking for Hand...'}</span>
          </div>
        )}
        {mode === 'webcam' && isWebcamActive && !isVideoReady && (
          <div className="flex items-center space-x-2 text-yellow-500">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="font-medium">Starting Camera...</span>
          </div>
        )}
        {mode === 'webcam' && !isWebcamActive && (
          <div className="flex items-center space-x-2 text-orange-500">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="font-medium">Camera Off</span>
          </div>
        )}
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
              className={`w-full h-96 object-cover rounded-xl ${
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
              className="pointer-events-none absolute inset-0 w-full h-96 rounded-xl"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isWebcamActive && (
              <div className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl h-96`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Webcam not active</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Selection */}
          {availableCameras.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Camera:</label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {availableCameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            
            {/* Manual Test Button */}
            <button
              onClick={() => {
                if (!isWebcamActive || !isVideoReady) {
                  setError('Please start the webcam first');
                  return;
                }
                console.log('[manual-test] Manual detection trigger');
                handleWebcamCapture();
              }}
              disabled={!isWebcamActive || !isVideoReady || isProcessing}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Testing...' : 'Test Detection'}
            </button>
            
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
              <div className="text-4xl mb-2">📤</div>
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
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Upload</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setPreviewUrl(null);
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

      {/* Recognition Result - Detailed Display */}
      {recognitionResult && (
        <div className="mt-6 space-y-4">
          {/* Main Result Card - Gamified */}
          <div className={`p-6 rounded-xl border-2 ${
            recognitionResult.isCorrect 
              ? 'bg-green-50 text-green-900 border-green-400' 
              : recognitionResult.confidence > 50
              ? 'bg-orange-50 text-orange-900 border-orange-400'
              : 'bg-red-50 text-red-900 border-red-400'
          }`}>
            <div className="text-center">
              {/* Achievement Badge */}
              <div className="mb-4">
                <div className="text-4xl mb-2">{recognitionResult.achievement}</div>
                <h3 className="text-2xl font-bold mb-2">
                  {recognitionResult.label || 'No Sign Detected'}
                </h3>
                <div className="flex justify-center items-center gap-4 mb-3">
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${
                    recognitionResult.isCorrect 
                      ? 'bg-green-200 text-green-800' 
                      : recognitionResult.confidence > 50
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {recognitionResult.confidence}% Confidence
                  </div>
                  {recognitionResult.xpEarned > 0 && (
                    <div className="inline-block px-4 py-2 rounded-full bg-blue-200 text-blue-800 text-lg font-semibold">
                      +{recognitionResult.xpEarned} XP
                    </div>
                  )}
                </div>
              </div>
              
              {/* Gamified Feedback Message */}
              <div className="text-xl font-semibold mb-4">
                {recognitionResult.feedback}
              </div>
              
              {/* Encouragement */}
              <div className="text-lg mb-4 text-gray-700">
                {recognitionResult.encouragement}
              </div>
              
              {/* Learning Info */}
              {recognitionResult.category !== 'Unknown' && (
                <div className="flex justify-center gap-4 text-sm mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                    📚 {recognitionResult.category}
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    🎯 {recognitionResult.difficulty}
                  </span>
                  <span className={`px-3 py-1 rounded-full ${recognitionResult.learningColor} bg-opacity-20`}>
                    {recognitionResult.learningIcon} {recognitionResult.learningLevel}
                  </span>
                </div>
              )}
              
              {/* Expected vs Detected */}
              {targetSign?.word && (
                <div className="text-lg mb-4">
                  <span className="font-medium">Expected: </span>
                  <span className="font-bold text-blue-600">{targetSign.word}</span>
                  <span className="mx-2">•</span>
                  <span className="font-medium">Detected: </span>
                  <span className="font-bold text-purple-600">{recognitionResult.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Result Validation */}
          {!recognitionResult.isValid && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Result Validation</h4>
              <p className="text-yellow-700 text-sm">
                This detection may not be accurate. Please ensure your hand is clearly visible and try making the sign again.
              </p>
            </div>
          )}

          {/* Low Quality Detection Warning */}
          {recognitionResult.isValid && !recognitionResult.isReasonable && (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Low Quality Detection</h4>
              <p className="text-orange-700 text-sm">
                The detection confidence is low ({recognitionResult.confidence}%). Try improving your hand position, lighting, or background for better accuracy.
              </p>
            </div>
          )}

          {/* Enhanced Educational Sign Information */}
          {recognitionResult.label && signDictionary[recognitionResult.label] && recognitionResult.isValid && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                📚 {recognitionResult.signName} - Learning Guide
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* How to Make the Sign */}
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    🤟 How to make this sign:
                  </h5>
                  <p className="text-blue-700 text-sm">{recognitionResult.signDescription}</p>
                </div>
                
                {/* When to Use It */}
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    💬 When to use it:
                  </h5>
                  <p className="text-blue-700 text-sm">{recognitionResult.signUsage}</p>
                </div>
              </div>
              
              {/* Pro Tips */}
              {recognitionResult.signTips && recognitionResult.signTips.length > 0 && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    💡 Pro Tips:
                  </h5>
                  <ul className="text-green-700 text-sm space-y-1">
                    {recognitionResult.signTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Common Mistakes */}
              {recognitionResult.commonMistakes && recognitionResult.commonMistakes.length > 0 && (
                <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    ⚠️ Common Mistakes to Avoid:
                  </h5>
                  <ul className="text-orange-700 text-sm space-y-1">
                    {recognitionResult.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Learning Progress & Assessment */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🎯 Learning Progress & Assessment
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Performance */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">📊 Current Performance</h5>
                <div className="space-y-2 text-sm">
                  {recognitionResult.confidence >= 90 && (
                    <p className="text-green-700 flex items-center gap-2">
                      <span className="text-green-600">🏆</span>
                      Excellent! The sign was recognized with very high confidence.
                    </p>
                  )}
                  {recognitionResult.confidence >= 70 && recognitionResult.confidence < 90 && (
                    <p className="text-orange-700 flex items-center gap-2">
                      <span className="text-orange-600">⭐</span>
                      Good recognition, but try to make the sign more clearly.
                    </p>
                  )}
                  {recognitionResult.confidence >= 50 && recognitionResult.confidence < 70 && (
                    <p className="text-yellow-700 flex items-center gap-2">
                      <span className="text-yellow-600">👍</span>
                      Partial recognition. Check your hand position and try again.
                    </p>
                  )}
                  {recognitionResult.confidence < 50 && (
                    <p className="text-red-700 flex items-center gap-2">
                      <span className="text-red-600">🔄</span>
                      Low confidence. Make sure your hand is clearly visible and in the detection area.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Learning Goals */}
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-2">🎯 Learning Goals</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Master Level (90%+)</span>
                    <span className={`px-2 py-1 rounded text-xs ${recognitionResult.confidence >= 90 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {recognitionResult.confidence >= 90 ? '✅ Achieved' : '🎯 Goal'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Advanced Level (70%+)</span>
                    <span className={`px-2 py-1 rounded text-xs ${recognitionResult.confidence >= 70 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {recognitionResult.confidence >= 70 ? '✅ Achieved' : '🎯 Goal'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Intermediate (50%+)</span>
                    <span className={`px-2 py-1 rounded text-xs ${recognitionResult.confidence >= 50 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {recognitionResult.confidence >= 50 ? '✅ Achieved' : '🎯 Goal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* XP and Achievement Summary */}
            {recognitionResult.xpEarned > 0 && (
              <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-yellow-800 mb-1">🏆 Achievement Unlocked!</h5>
                    <p className="text-yellow-700 text-sm">You earned {recognitionResult.xpEarned} XP for this sign!</p>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    +{recognitionResult.xpEarned} XP
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Sign Learning Chatbot */}
      <SignLearningChatbot 
        detectedSign={recognitionResult}
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        signDictionary={signDictionary}
      />

      {/* Sign Video Tutorial */}
      <SignVideoTutorial 
        signLabel={recognitionResult?.label}
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        signDictionary={signDictionary}
      />
    </div>
  );
}