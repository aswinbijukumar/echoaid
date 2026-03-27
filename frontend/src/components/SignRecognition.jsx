import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { detectImageFromDataUrl } from '../utils/recognitionClient';
import { analyzeSign } from '../utils/HandGeometry';
import { SIGN_RULES } from '../constants/SignRules';
import { useTheme } from '../hooks/useTheme';
import FloatingChatbot from './FloatingChatbot';
import {
  ChatBubbleLeftRightIcon,
  PlayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export default function SignRecognition({
  targetSign,
  onRecognition,
  mode = 'webcam' // 'webcam' or 'upload'
}) {
  const { darkMode } = useTheme();
  const [currentMode, setCurrentMode] = useState(mode);
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
  // Floating chatbot now replaces inline toggle
  const wsRef = useRef(null);
  const wsReadyRef = useRef(false);
  const handsRef = useRef(null);

  // Refs to access latest state in callbacks
  const targetSignRef = useRef(targetSign);
  const currentModeRef = useRef(currentMode);

  const onRecognitionRef = useRef(onRecognition);

  useEffect(() => {
    targetSignRef.current = targetSign;
    currentModeRef.current = currentMode;
    onRecognitionRef.current = onRecognition;
  }, [targetSign, currentMode, onRecognition]);

  // Enhanced sign dictionary with gamification elements - UPDATED FOR ISL (Indian Sign Language)
  const signDictionary = useMemo(() => ({
    // --- NUMBERS (0-9) ---
    '0': {
      name: 'Number 0',
      description: 'Form a circle with your thumb and fingers, mimicking a zero.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Make a complete circle', 'Keep hand steady', 'Show clearly to camera'],
      commonMistakes: ['Gap in circle', 'Fingers too loose', 'Hand blocked by body'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '1': {
      name: 'Number 1',
      description: 'Extend your index finger vertically (palm facing out).',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Index finger straight up', 'Other fingers closed', 'Palm facing forward'],
      commonMistakes: ['Index finger bent', 'Other fingers sticking out', 'Palm facing sideways'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '2': {
      name: 'Number 2',
      description: 'Extend your index and middle fingers in a "V" shape (palm facing out).',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Spread fingers for V shape', 'Palm facing forward', 'Keep fingers straight'],
      commonMistakes: ['Fingers touching', 'Palm facing inward', 'Thumb sticking out'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '3': {
      name: 'Number 3',
      description: 'Extend your index, middle, and ring fingers vertically.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Three fingers straight up', 'Pinky and thumb connected', 'Spread slightly'],
      commonMistakes: ['Pinky sticking up', 'Thumb vertical', 'Fingers curled'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '4': {
      name: 'Number 4',
      description: 'Extend all four fingers vertically, tucking the thumb into the palm.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Four fingers straight', 'Thumb tucked in palm', 'Palm facing forward'],
      commonMistakes: ['Thumb sticking out', 'Fingers spaced too far', 'Pinky bent'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '5': {
      name: 'Number 5',
      description: 'Extend all five fingers and the thumb fully.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Open hand wide', 'Fingers spread apart', 'Palm facing forward'],
      commonMistakes: ['Fingers touching', 'Hand cupped', 'Thumb bent'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '6': {
      name: 'Number 6',
      description: 'Extend only your pinky finger vertically.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Beginner',
      category: 'Numbers',
      tips: ['Pinky straight up', 'Other fingers in fist', 'Hold steady'],
      commonMistakes: ['Pinky bent', 'Index finger extending', 'Loose fist'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    '7': {
      name: 'Number 7',
      description: 'Bend your index finger into a hook shape.',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Hook index finger clearly', 'Other fingers closed', 'Show profile view if needed'],
      commonMistakes: ['Index finger too straight', 'Hook too tight', 'Confusing with 1 or X'],
      learningLevel: 'Building',
      xpValue: 15
    },
    '8': {
      name: 'Number 8',
      description: 'Extend your thumb, index, and middle fingers (similar to a "3" but with the thumb).',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Spread thumb, index, middle', 'Ring and pinky down', 'Palm forward'],
      commonMistakes: ['Confusing with 3', 'Ring finger up', 'Fingers too close'],
      learningLevel: 'Building',
      xpValue: 15
    },
    '9': {
      name: 'Number 9',
      description: 'Extend your thumb and pinky finger (like a "call me" gesture).',
      usage: 'Used for counting, mathematics, and numerical communication.',
      difficulty: 'Intermediate',
      category: 'Numbers',
      tips: ['Thumb and pinky out', 'Middle fingers curled', 'Rotate wrist slightly'],
      commonMistakes: ['Index finger out', 'Pinky not straight', 'Looking like Y'],
      learningLevel: 'Building',
      xpValue: 15
    },

    // --- ALPHABET (A-Z) ISL ---
    'A': {
      name: 'Letter A',
      description: 'Touch the tips of both thumbs together to form a point.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Use both hands', 'Touch thumb tips only', 'Fingers curled or relaxed'],
      commonMistakes: ['Touching wrong fingers', 'Not forming a point', 'Hands too far apart'],
      learningLevel: 'Building',
      xpValue: 10
    },
    'B': {
      name: 'Letter B',
      description: 'Make circles with both hands (thumb and index touching) and join them side-by-side like glasses.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Form "OK" sign with both hands', 'Join thumb/index circles', 'Hold near chest'],
      commonMistakes: ['Circles not touching', 'Wrong fingers used', 'Hands blocked'],
      learningLevel: 'Building',
      xpValue: 10
    },
    'C': {
      name: 'Letter C',
      description: 'Curve one hand into a "C" shape.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Curve all fingers', 'Make a C shape', 'Palm facing side'],
      commonMistakes: ['Shape too flat', 'Fingers spread', 'Not facing side'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'D': {
      name: 'Letter D',
      description: 'Hold non-dominant index finger up; touch its tip and base with dominant index and thumb to form a loop.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Vertical finger steady', 'Make distinct D loop', 'Touch precise points'],
      commonMistakes: ['Loop not closed', 'Wrong finger vertical', 'Hands shaking'],
      learningLevel: 'Mastering',
      xpValue: 20
    },
    'E': {
      name: 'Letter E',
      description: 'Point one index finger into the center of a small "C" shape made by the other hand.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Make tight C with left hand', 'Touch center with right index', 'Show clearly'],
      commonMistakes: ['C too open', 'Missing center', 'Hands crossing'],
      learningLevel: 'Mastering',
      xpValue: 15
    },
    'F': {
      name: 'Letter F',
      description: 'Place index and middle fingers of dominant hand horizontally across same fingers of other hand.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Two fingers on each hand', 'Cross them perpendicularly', 'Press together'],
      commonMistakes: ['Crossing only one finger', 'Wrong angle', 'Fingers spread'],
      learningLevel: 'Mastering',
      xpValue: 15
    },
    'G': {
      name: 'Letter G',
      description: 'Stack your two closed fists vertically.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Make two fists', 'Place one on top of other', 'Keep thumbs tucked'],
      commonMistakes: ['Fists properly closed', 'Not vertical', 'Hands offset'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'H': {
      name: 'Letter H',
      description: 'Lay your dominant palm flat across the fingers of your vertical non-dominant hand.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['One hand vertical flat', 'Other hand horizontal flat', 'Cross near fingers'],
      commonMistakes: ['Hands not flat', 'Crossing at wrist', 'Fingers spread'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'I': {
      name: 'Letter I',
      description: 'Hold your index finger straight up (same as "1").',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Single finger up', 'Others closed', 'Hold steady'],
      commonMistakes: ['Pinky up (that is "I" in ASL!)', 'Fist loose', 'Bent index'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'J': {
      name: 'Letter J',
      description: 'Form an "L" shape with one hand and touch the top of it with the index finger of the other.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Make clean L shape', 'Touch tip of index', 'Use two hands'],
      commonMistakes: ['One handed J (ASL)', 'Touching thumb', 'L shape backward'],
      learningLevel: 'Mastering',
      xpValue: 20
    },
    'K': {
      name: 'Letter K',
      description: 'Point dominant index finger up and hook other index finger onto its middle joint.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['One finger vertical', 'Bend other index finger', 'Hook at joint'],
      commonMistakes: ['Hooking wrong place', 'Both straight', 'Looking like "X"'],
      learningLevel: 'Mastering',
      xpValue: 20
    },
    'L': {
      name: 'Letter L',
      description: 'Create an "L" with your thumb and index finger.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Thumb and index 90 degrees', 'Palm facing forward', 'Other fingers closed'],
      commonMistakes: ['Index bent', 'Thumb too close', 'Palm sideways'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'M': {
      name: 'Letter M',
      description: 'Lay three fingers (index, middle, ring) onto the opposite palm.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Three fingers flat', 'Place on open palm', 'Fingers together'],
      commonMistakes: ['Using 4 fingers', 'Fingers spread', 'Palm closed'],
      learningLevel: 'Mastering',
      xpValue: 15
    },
    'N': {
      name: 'Letter N',
      description: 'Lay two fingers (index, middle) onto the opposite palm.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Two fingers flat', 'Place on open palm', 'Fingers together'],
      commonMistakes: ['Using 1 or 3 fingers', 'Fingers spread', 'Palm closed'],
      learningLevel: 'Mastering',
      xpValue: 15
    },
    'O': {
      name: 'Letter O',
      description: 'Create a circle with one hand.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Fingertips meet thumb', 'Round shape', 'Show hole clearly'],
      commonMistakes: ['Flat shape', 'Fingers not touching', 'Block view'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'P': {
      name: 'Letter P',
      description: 'Point one index finger up; touch other index to top and thumb to middle to form loop.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Vertical finger steady', 'Make P loop on side', 'Use both hands'],
      commonMistakes: ['One hand P (ASL)', 'Loop too small', 'Wrong fingers'],
      learningLevel: 'Mastering',
      xpValue: 20
    },
    'Q': {
      name: 'Letter Q',
      description: 'Form circle with one hand and hook other index finger through top loop.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Make "O" hand', 'Hook index into it', 'Show clearly'],
      commonMistakes: ['One hand Q (ASL)', 'Hooking thumb', 'Circle broken'],
      learningLevel: 'Mastering',
      xpValue: 20
    },
    'R': {
      name: 'Letter R',
      description: 'Hook your dominant index finger onto the palm of your other hand.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['One hand open palm', 'Hook index finger called', 'Place on palm'],
      commonMistakes: ['Crossed fingers R (ASL)', 'Finger straight', 'Wrong hand'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'S': {
      name: 'Letter S',
      description: 'Interlock your pinky fingers.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Hook both pinkies', 'Pull slightly', 'Hands horizontal'],
      commonMistakes: ['Fist S (ASL)', 'Hooking index fingers', 'Hands vertical'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'T': {
      name: 'Letter T',
      description: 'Place dominant index finger horizontally across tip of vertical non-dominant index finger.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Make a T shape', 'One finger vertical', 'One finger horizontal top'],
      commonMistakes: ['ASL T (Thumb tucked)', 'Crossing in middle', 'Hands shaking'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'U': {
      name: 'Letter U',
      description: 'Hold hand up with index and pinky fingers extended and thumb out.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Index and Pinky up', 'Thumb out', 'Middle/Ring down'],
      commonMistakes: ['Fingers together (ASL U)', 'Pinky down', 'Thumb in'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'V': {
      name: 'Letter V',
      description: 'Hold your index and middle fingers in a "V" (palm facing out).',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Beginner',
      category: 'Alphabet',
      tips: ['Spread index and middle', 'V shape', 'Palm forward'],
      commonMistakes: ['Fingers together', 'Palm back', '3 fingers up'],
      learningLevel: 'Foundation',
      xpValue: 10
    },
    'W': {
      name: 'Letter W',
      description: 'Interlace all fingers of both hands together.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Clasp hands together', 'Fingers interlaced', 'Elbows out'],
      commonMistakes: ['3 fingers up W (ASL)', 'Fists bumping', 'Loose clasp'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'X': {
      name: 'Letter X',
      description: 'Cross both index fingers to form an "X".',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Use index fingers', 'Cross in middle', 'Show X shape'],
      commonMistakes: ['Hooked finger X (ASL)', 'Crossing wrists', 'Using arms'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'Y': {
      name: 'Letter Y',
      description: 'Extend thumb and pinky, pointing thumb side toward opposite palm.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Intermediate',
      category: 'Alphabet',
      tips: ['Y handshape', 'Thumb towards palm', 'Two hands interaction'],
      commonMistakes: ['One hand Y (ASL)', 'Palm facing out', 'Wrong orientation'],
      learningLevel: 'Building',
      xpValue: 15
    },
    'Z': {
      name: 'Letter Z',
      description: 'Hold one hand flat (palm sideways) and touch edge of other hand to its center.',
      usage: 'Used in spelling words, names, and as a standalone letter.',
      difficulty: 'Advanced',
      category: 'Alphabet',
      tips: ['Flat hand vertical', 'Other hand horizontal', 'Touch center palm'],
      commonMistakes: ['Tracing Z in air (ASL)', 'Hands flat', 'Wrong angle'],
      learningLevel: 'Mastering',
      xpValue: 20
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
  // Initialize MediaPipe Hands
  const initializeHands = useCallback(async () => {
    try {
      if (!videoRef.current) return;

      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2, // Upgraded for ISL Support
        modelComplexity: 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.8
      });

      hands.onResults((results) => {
        // Handle BOTH hands (ISL requires 2 hands for most signs)
        const multiLandmarks = results.multiHandLandmarks;
        const handedness = results.multiHandedness;

        if (multiLandmarks && multiLandmarks.length > 0) {
          const video = videoRef.current;

          if (video && video.videoWidth > 0) {
            // Simplified bounding box (covers all detected hands)
            setHandDetected(true);

            // --- Geometric Analysis Integration (Enhanced for ISL) ---
            const currentMode = currentModeRef.current;
            const targetSign = targetSignRef.current;

            if (currentMode === 'webcam' && targetSign?.word) {
              const signKey = targetSign.word.charAt(0).toUpperCase();

              // Determine which ruleset to use (ISL or Standard)
              // For now, we assume we check against ISL rules if available, or fallback
              // We need to import ISL rules, but for now let's pass the raw data to analysis

              // We pass ALL landmarks to the analysis function
              const analysis = analyzeSign(multiLandmarks, handedness, signKey);

              if (analysis.isMatch || analysis.score > 40) {
                setRecognitionResult({
                  label: signKey,
                  confidence: analysis.score,
                  isCorrect: analysis.isMatch,
                  feedback: analysis.isMatch ? "Perfect!" : analysis.feedback[0],
                  improvements: analysis.feedback,
                  isValid: true,
                  isReasonable: true,
                  xpEarned: analysis.isMatch ? 10 : 0,
                  achievement: analysis.isMatch ? '🌟' : '',
                  encouragement: analysis.isMatch ? 'Great Job!' : 'Keep going!',
                  signName: analysis.signName || signKey,
                  signDescription: analysis.description || "Practice Sign",
                  modelSource: 'ISL_GeometricEngine'
                });

                if (analysis.isMatch) {
                  if (onRecognitionRef.current) {
                    onRecognitionRef.current({
                      label: signKey,
                      confidence: analysis.score,
                      isCorrect: true
                    });
                  }
                }
              }
            }
          }
        } else {
          setHandDetected(false);
          setHandBoundingBox(null);
        }
      });

      handsRef.current = hands;

      // Start Camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      camera.start();

      console.log('[hand] MediaPipe Hands initialized');
    } catch (error) {
      console.error('[hand] Failed to initialize MediaPipe Hands:', error);
      setError("Failed to load hand tracking model.");
    }
  }, []); // Empty dependency array - initialize only once

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
  const initializeWebcam = useCallback(async (overrideDeviceId) => {
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
          ...((overrideDeviceId || selectedCameraId) ? { deviceId: { exact: overrideDeviceId || selectedCameraId } } : { facingMode: 'user' })
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
    return () => {
      // Cleanup on unmount or re-run
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
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
      setError(`Recognition request failed: ${e?.message || 'unknown error'}`);
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

  // Capture frame from webcam with optional cropping; returns null if frame is too dark/blank
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

    // Heuristic: skip if the frame is mostly dark (e.g., camera off or covered)
    try {
      const sample = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = sample.data;
      let sum = 0;
      // stride to speed up (sample every 16th pixel)
      const stride = 16 * 4;
      for (let i = 0; i < data.length; i += stride) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // luminance approximation
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      const sampledPixels = Math.ceil(data.length / stride);
      const avg = sampledPixels > 0 ? sum / sampledPixels : 0;
      if (avg < 2) {
        // extremely dark frame; treat as blank
        return null;
      }
    } catch {
      // If inspection fails, proceed without dark-frame rejection
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
    if (!isWebcamActive || !video || !video.srcObject || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
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

    // Require a hand to be detected to proceed with recognition
    if (!handDetected) {
      // Avoid spamming errors if camera is on but no hand is present
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
      // Likely a blank/dark frame or video not ready; skip without surfacing an error
      console.log('[realtime] Blank/dark frame, skipping');
      return;
    }
  }, [isWebcamActive, getDetectionArea, captureFrame, sendFrameRealtime, recognizeViaBackend, processImage, setError, processVideoFrame, handDetected]);

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
  // Detection area overlay removed — MediaPipe draws directly via onResults callback

  // Initialize webcam when component mounts
  useEffect(() => {
    if (mode === 'webcam') {
      initializeWebcam();
      openWebSocket();
    }

    const onVisibility = () => {
      if (document.hidden) {
        // Pause capture when tab hidden
        setIsProcessing(true);
      } else {
        setIsProcessing(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

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
      document.removeEventListener('visibilitychange', onVisibility);
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
              {currentMode === 'webcam'
                ? 'Show your sign to the camera for real-time recognition'
                : 'Upload an image to recognize the sign'
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mode Toggle */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <button
                onClick={() => {
                  setCurrentMode('webcam');
                  setPreviewUrl(null);
                  setError('');
                }}
                className={`px-4 py-2 rounded-md transition-colors ${currentMode === 'webcam'
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white/20'
                  }`}
              >
                📹 Webcam
              </button>
              <button
                onClick={() => {
                  setCurrentMode('upload');
                  stopWebcam();
                  setError('');
                }}
                className={`px-4 py-2 rounded-md transition-colors ${currentMode === 'upload'
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white/20'
                  }`}
              >
                📤 Upload
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {availableCameras.length > 1 && (
                <>
                  <label className="text-sm text-white/80">Camera</label>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedCameraId(id);
                      stopWebcam();
                      setTimeout(() => initializeWebcam(id), 0);
                    }}
                    className="bg-white/20 text-white rounded-lg px-3 py-2 focus:outline-none"
                  >
                    {availableCameras.map((c, i) => (
                      <option key={c.deviceId || i} value={c.deviceId} className="text-black">
                        {c.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <button
                onClick={() => enumerateCameras()}
                className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <div className={`flex items-center space-x-2 text-green-500`}>
          <div className={`w-3 h-3 rounded-full bg-green-500`}></div>
          <span className="font-medium">Model Ready</span>
        </div>
        {currentMode === 'webcam' && isWebcamActive && isVideoReady && (
          <div className={`flex items-center space-x-2 ${isProcessing ? 'text-blue-500' : handDetected ? 'text-green-500' : 'text-yellow-500'}`}>
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : handDetected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            <span className="font-medium">{isProcessing ? 'Analyzing...' : handDetected ? 'Hand Detected' : 'Looking for Hand...'}</span>
          </div>
        )}
        {currentMode === 'webcam' && isWebcamActive && !isVideoReady && (
          <div className="flex items-center space-x-2 text-yellow-500">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="font-medium">Starting Camera...</span>
          </div>
        )}
        {currentMode === 'webcam' && !isWebcamActive && (
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

      {currentMode === 'webcam' ? (
        <div className="space-y-4">
          {/* Webcam Video */}
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-96 object-cover rounded-xl ${!isWebcamActive
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

            {/* Mirror Button */}
            {isWebcamActive && (
              <button
                onClick={() => {
                  const v = videoRef.current;
                  const o = overlayRef.current;
                  if (v) {
                    const mirrored = v.style.transform === 'scaleX(-1)';
                    v.style.transform = mirrored ? 'scaleX(1)' : 'scaleX(-1)';
                    if (o) o.style.transform = mirrored ? 'scaleX(1)' : 'scaleX(-1)';
                  }
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                🪞 Mirror
              </button>
            )}

          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Enhanced Image Upload with Drag & Drop */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${isDragOver
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
          <div className={`p-6 rounded-xl border-2 ${recognitionResult.isCorrect
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
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${recognitionResult.isCorrect
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

      {/* Floating Sign Learning Chatbot */}
      <FloatingChatbot
        detectedSign={recognitionResult}
        signDictionary={signDictionary}
      />
    </div>
  );
}