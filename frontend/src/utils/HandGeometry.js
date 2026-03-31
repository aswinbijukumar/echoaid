import { ISL_SIGN_RULES as SIGN_RULES } from '../constants/ISLSignRules';

/**
 * HandGeometry.js
 * 
 * A pure mathematical utility library for analyzing hand landmarks from MediaPipe.
 * REFRACTORED for Strict ASL Support and Geometric Transparency.
 */

// Landmark Indices (MediaPipe Standard)
export const LANDMARKS = {
  WRIST: 0,
  THUMB: { CMC: 1, MCP: 2, IP: 3, TIP: 4 },
  INDEX: { MCP: 5, PIP: 6, DIP: 7, TIP: 8 },
  MIDDLE: { MCP: 9, PIP: 10, DIP: 11, TIP: 12 },
  RING: { MCP: 13, PIP: 14, DIP: 15, TIP: 16 },
  PINKY: { MCP: 17, PIP: 18, DIP: 19, TIP: 20 }
};

/**
 * Calculates the Euclidean distance between two 3D points.
 */
export const calculateDistance = (p1, p2) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
};

/**
 * Calculates the angle (in degrees) formed by three points (p1 -> p2 -> p3).
 */
export const calculateAngle = (p1, p2, p3) => {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  const cosAngle = dot / (mag1 * mag2);
  const clampedCos = Math.min(1, Math.max(-1, cosAngle));
  return Math.acos(clampedCos) * (180 / Math.PI);
};

/**
 * Gets detailed stats for a single finger
 */
export const getFingerStats = (landmarks, fingerName) => {
  if (fingerName === 'THUMB') return getThumbStats(landmarks);

  const indices = LANDMARKS[fingerName];
  const mcp = landmarks[indices.MCP];
  const pip = landmarks[indices.PIP];
  const dip = landmarks[indices.DIP];
  const tip = landmarks[indices.TIP];

  // Bending angle
  const angle = calculateAngle(mcp, pip, dip);

  // State classification
  let state = 'HALF';
  if (angle > 150) state = 'STRAIGHT';
  if (angle < 100) state = 'CURLED';

  return { angle: Math.round(angle), state };
};

const getThumbStats = (landmarks) => {
  const cmc = landmarks[LANDMARKS.THUMB.CMC];
  const mcp = landmarks[LANDMARKS.THUMB.MCP];
  const ip = landmarks[LANDMARKS.THUMB.IP];

  const angle = calculateAngle(cmc, mcp, ip);

  let state = 'HALF';
  if (angle > 150) state = 'STRAIGHT';
  if (angle < 100) state = 'CURLED';

  return { angle: Math.round(angle), state };
};

/**
 * NEW: Export Raw Stats for Debug Overlay
 * Used by ASLSpeedDrill to show "Real Logic"
 */
export const getRawHandStats = (landmarks) => {
  if (!landmarks) return null;
  return {
    THUMB: getFingerStats(landmarks, 'THUMB').angle,
    INDEX: getFingerStats(landmarks, 'INDEX').angle,
    MIDDLE: getFingerStats(landmarks, 'MIDDLE').angle,
    RING: getFingerStats(landmarks, 'RING').angle,
    PINKY: getFingerStats(landmarks, 'PINKY').angle,
  };
};

/**
 * Checks if two points are "touching" (Euclidean distance < threshold).
 * Threshold defaults to 0.05 (normalized coordinates).
 */
export const checkTouch = (p1, p2, threshold = 0.05) => {
  if (!p1 || !p2) return false;
  const dist = calculateDistance(p1, p2);
  return dist < threshold;
};

/**
 * Checks Z-axis depth difference.
 * Useful for ensuring fingers are ON the palm, not just in front of it 2D-wise.
 */
export const checkZDepth = (p1, p2, threshold = 0.1) => {
  if (!p1 || !p2) return false;
  return Math.abs(p1.z - p2.z) < threshold;
};

/**
 * Detects palm orientation (FRONT vs BACK).
 * Logic: Compares Index MCP and Pinky MCP X-positions relative to handedness.
 * Handedness is 'Left' or 'Right' as reported by MediaPipe.
 */
export const getPalmOrientation = (landmarks, handLabel) => {
  if (!landmarks || landmarks.length < 21) return 'UNKNOWN';
  
  const indexMCP = landmarks[LANDMARKS.INDEX.MCP];
  const pinkyMCP = landmarks[LANDMARKS.PINKY.MCP];
  
  // If Right Hand: 
  // Index.x < Pinky.x => Back of hand facing camera (Palm Facing Signer)
  // Index.x > Pinky.x => Palm facing camera
  
  // Note: MediaPipe X is 0 (left) to 1 (right).
  // If we are mirrored, the camera view is already flipped.
  
  const isIndexToLeft = indexMCP.x < pinkyMCP.x;
  
  if (handLabel === 'Right') {
    return isIndexToLeft ? 'BACK' : 'FRONT';
  } else {
    // Left Hand is mirrored logic
    return isIndexToLeft ? 'FRONT' : 'BACK';
  }
};

// ... existing code ...

/**
 * Analyzes the user's hand(s) against ISL rules.
 * Supports SINGLE_HANDED and TWO_HANDED signs.
 */
export const analyzeSign = (multiLandmarks, handedness, signKey) => {
  if (!multiLandmarks || multiLandmarks.length === 0) {
    return { isMatch: false, score: 0, feedback: ['No hands detected'] };
  }

  const handLabel = handedness && handedness[0] ? handedness[0].label : 'Right';

  // 1. Get Target Rule
  const rule = SIGN_RULES[signKey];
  if (!rule) {
    // If no specific ISL rule, fallback to basic single-sign check or return 0
    return { isMatch: false, score: 0, feedback: [`No geometric rule for ${signKey}`] };
  }

  const feedback = [];
  let totalScore = 0;
  let maxScore = 0;

  // 2. Identify Hands (Dominant vs Base)
  // For simplicity: If 1 hand, it's Dominant. If 2, we try to match roles.
  // ISL is flexible, but usually, right-handers use Right as Dominant.
  // We will check BOTH permutations if 2 hands are present to support Lefties.

  let handsToCheck = [];

  if (multiLandmarks.length === 1) {
    // Single hand detected
    if (rule.type === 'TWO_HANDED') {
      return {
        isMatch: false,
        score: 0,
        feedback: ['Requires TWO hands', `Please show both hands for ${rule.name}`]
      };
    }
    handsToCheck.push({ dominant: multiLandmarks[0], base: null });
  } else {
    // Two hands detected - Check both Dominant/Base combos
    handsToCheck.push({ dominant: multiLandmarks[1], base: multiLandmarks[0] }); // Right-handed dominant assumption usually index 1
    handsToCheck.push({ dominant: multiLandmarks[0], base: multiLandmarks[1] }); // Swap
  }

  // Run analysis on possible hand configurations and take the BEST score
  let bestResult = { score: 0, feedback: [] };

  for (const config of handsToCheck) {
    let currentScore = 0;
    let currentMax = 0;
    let currentFeedback = [];

    // A. Check Dominant Hand Fingers
    if (rule.fingers && rule.fingers.DOMINANT) {
      for (const [finger, reqState] of Object.entries(rule.fingers.DOMINANT)) {
        if (!config.dominant) continue;
        const stats = getFingerStats(config.dominant, finger);
        currentMax += 20;

        if (stats.state === reqState) {
          currentScore += 20;
        } else if (reqState === 'HALF' && (stats.state === 'CURLED' || stats.state === 'STRAIGHT')) {
          currentScore += 10; // Lenient
        } else {
          currentFeedback.push(`Dominant ${finger} should be ${reqState}`);
        }
      }
    }

    // B. Check Base Hand Fingers (if rule requires it)
    if (rule.fingers && rule.fingers.BASE) {
      if (!config.base) {
        currentMax += (Object.keys(rule.fingers.BASE).length * 20);
        currentFeedback.push("Base hand missing");
      } else {
        for (const [finger, reqState] of Object.entries(rule.fingers.BASE)) {
          const stats = getFingerStats(config.base, finger);
          currentMax += 20;
          if (stats.state === reqState) {
            currentScore += 20;
          } else {
            currentFeedback.push(`Base ${finger} should be ${reqState}`);
          }
        }
      }
    }

    // C. Check Geometric Constraints (Touch, Distance, etc.)
    if (rule.geometry && Array.isArray(rule.geometry)) {
      for (const geo of rule.geometry) {
        currentMax += 30; // Geometry rules are high value

        // Resolve points
        const getPoint = (desc) => {
          const [handRole, finger, part] = desc.split('_'); // e.g. DOMINANT_INDEX_TIP
          const hand = handRole === 'DOMINANT' ? config.dominant : config.base;
          if (!hand) return null;
          // Special case for PALM CENTER
          if (finger === 'PALM') return hand[0]; // Wrist/Palm-base approx
          return hand[LANDMARKS[finger][part]];
        };

        const p1 = getPoint(geo.p1 + '_' + geo.part1);
        const p2 = getPoint(geo.p2 + '_' + geo.part2);

        let passed = false;

        if (geo.type === 'DISTANCE') {
          if (checkTouch(p1, p2, geo.maxDistance || 0.05)) passed = true;
        }
        // Add other types like ANGLE or X_ALIGNMENT here if needed

        if (passed) {
          currentScore += 30;
        } else {
          currentFeedback.push(geo.message || "Alignment incorrect");
        }
      }
    }

    // D. Check Orientation (FRONT vs BACK)
    if (rule.orientation) {
      currentMax += 20;
      const actualOrientation = getPalmOrientation(config.dominant, handLabel);
      if (actualOrientation === rule.orientation) {
        currentScore += 20;
      } else {
        currentFeedback.push(`Hand should be facing ${rule.orientation === 'FRONT' ? 'the camera (Palm)' : 'you (Back)'}`);
      }
    }

    const percent = currentMax > 0 ? (currentScore / currentMax) * 100 : 0;
    if (percent > bestResult.score) {
      bestResult = { score: percent, feedback: currentFeedback };
    }
  }

  const finalScore = Math.round(bestResult.score);
  const isMatch = finalScore >= 80;

  return {
    isMatch,
    score: finalScore,
    feedback: isMatch ? ['Perfect!'] : bestResult.feedback.slice(0, 3),
    signName: rule.name,
    description: rule.description
  };
};
