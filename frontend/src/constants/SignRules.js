/**
 * SignRules.js
 * 
 * Defines the geometric "Gold Standard" for ASL (American Sign Language).
 * Used by HandGeometry.js to validate user signs with high precision.
 * 
 * FORMAT:
 * keys: 'A', 'B', etc.
 * values: {
 *   description: String,
 *   fingers: {
 *     [FINGER]: { 
 *       state: 'STRAIGHT' | 'CURLED' | 'HALF', 
 *       minAngle: Number (0-180), // Optional strict check
 *       maxAngle: Number (0-180)  // Optional strict check
 *     }
 *   },
 *   specialRules: [
 *     { type: 'THUMB_CROSS', target: 'INDEX', maxDist: 0.1 } 
 *   ]
 * }
 */

export const SIGN_RULES = {
    // --- ALPHABET (ASL) ---

    'A': {
        name: 'Letter A',
        description: "Fist with thumb resting against the side of the index finger.",
        fingers: {
            THUMB: { state: 'STRAIGHT', minAngle: 150 }, // Thumb straight up against hand
            INDEX: { state: 'CURLED', maxAngle: 90 },
            MIDDLE: { state: 'CURLED', maxAngle: 90 },
            RING: { state: 'CURLED', maxAngle: 90 },
            PINKY: { state: 'CURLED', maxAngle: 90 }
        }
    },

    'B': {
        name: 'Letter B',
        description: "Open palm, fingers together, thumb tucked in across palm.",
        fingers: {
            THUMB: { state: 'CURLED' }, // Tucked
            INDEX: { state: 'STRAIGHT', minAngle: 150 },
            MIDDLE: { state: 'STRAIGHT', minAngle: 150 },
            RING: { state: 'STRAIGHT', minAngle: 150 },
            PINKY: { state: 'STRAIGHT', minAngle: 150 }
        }
    },

    'C': {
        name: 'Letter C',
        description: "Hand forms a C shape.",
        fingers: {
            THUMB: { state: 'CURVED' }, // Special state, handled loosely or as HALF
            INDEX: { state: 'HALF' },   // Not fully straight, not fully curled
            MIDDLE: { state: 'HALF' },
            RING: { state: 'HALF' },
            PINKY: { state: 'HALF' }
        }
    },

    'D': {
        name: 'Letter D',
        description: "Index finger up, thumb and other fingers form a circle.",
        fingers: {
            INDEX: { state: 'STRAIGHT', minAngle: 150 },
            MIDDLE: { state: 'CURLED', maxAngle: 100 },
            RING: { state: 'CURLED', maxAngle: 100 },
            PINKY: { state: 'CURLED', maxAngle: 100 },
            THUMB: { state: 'CURLED' } // Touching middle/ring
        }
    },

    'E': {
        name: 'Letter E',
        description: "Fingers curled down touching thumb.",
        fingers: {
            THUMB: { state: 'CURLED' },
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'F': {
        name: 'Letter F',
        description: "Index and thumb touch (OK sign), others spread.",
        fingers: {
            INDEX: { state: 'CURLED' }, // Touching thumb
            THUMB: { state: 'CURLED' },
            MIDDLE: { state: 'STRAIGHT', minAngle: 150 },
            RING: { state: 'STRAIGHT', minAngle: 150 },
            PINKY: { state: 'STRAIGHT', minAngle: 150 }
        }
    },

    // G: Index points side, thumb parallel. Hard in 2D without depth, assuming Index Straight, others curled
    'G': {
        name: 'Letter G',
        description: "Index finger points, thumb parallel.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' },
            THUMB: { state: 'STRAIGHT' }
        }
    },

    'H': {
        name: 'Letter H',
        description: "Index and Middle fingers straight and together.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'STRAIGHT' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' },
            THUMB: { state: 'CURLED' } // Tucked
        }
    },

    'I': {
        name: 'Letter I',
        description: "Pinky straight up, others curled.",
        fingers: {
            PINKY: { state: 'STRAIGHT', minAngle: 150 },
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            THUMB: { state: 'CURLED' } // Tucked
        }
    },

    // J is dynamic (motion), for static frame treat like I
    'J': {
        name: 'Letter J',
        description: "Pinky up (Motion required, matched as I statically).",
        fingers: {
            PINKY: { state: 'STRAIGHT' },
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            THUMB: { state: 'CURLED' }
        }
    },

    'K': {
        name: 'Letter K',
        description: "Index straight, Middle half-up, Thumb between.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'STRAIGHT' }, // Often fully straight in simplified detection
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' },
            THUMB: { state: 'STRAIGHT' }
        }
    },

    'L': {
        name: 'Letter L',
        description: "Index and Thumb form an L shape.",
        fingers: {
            INDEX: { state: 'STRAIGHT', minAngle: 150 },
            THUMB: { state: 'STRAIGHT', minAngle: 150 },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'M': {
        name: 'Letter M',
        description: "Three fingers over thumb (Fist-like).",
        fingers: {
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' },
            THUMB: { state: 'CURLED' } // Detection very hard vs A/S/N/T/E without depth
        }
    },

    'N': {
        name: 'Letter N',
        description: "Two fingers over thumb.",
        fingers: {
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'O': {
        name: 'Letter O',
        description: "Fingers and thumb form a circle.",
        fingers: {
            INDEX: { state: 'CURLED' }, // Full curl to touch thumb
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' },
            THUMB: { state: 'CURLED' }
        }
    },

    'P': {
        name: 'Letter P',
        description: "Index straight down, middle down (Looks like K down).",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'STRAIGHT' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'Q': {
        name: 'Letter Q',
        description: "Index and Thumb down.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            THUMB: { state: 'STRAIGHT' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'R': {
        name: 'Letter R',
        description: "crossed fingers.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'STRAIGHT' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'S': {
        name: 'Letter S',
        description: "Fist with thumb OVER fingers.",
        fingers: {
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' },
            THUMB: { state: 'CURLED' } // Hard to distinguish S from A without thumb pos
        }
    },

    'T': {
        name: 'Letter T',
        description: "Thumb between index and middle.",
        fingers: {
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'U': {
        name: 'Letter U',
        description: "Index and Middle straight and together.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'STRAIGHT' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'V': {
        name: 'Letter V',
        description: "Index and Middle straight and apart.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'STRAIGHT' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'W': {
        name: 'Letter W',
        description: "Index, Middle, Ring straight.",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'STRAIGHT' },
            RING: { state: 'STRAIGHT' },
            PINKY: { state: 'CURLED' }
        }
    },

    'X': {
        name: 'Letter X',
        description: "Index hooked.",
        fingers: {
            INDEX: { state: 'HALF' }, // Hooked
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    'Y': {
        name: 'Letter Y',
        description: "Thumb and Pinky out.",
        fingers: {
            THUMB: { state: 'STRAIGHT' },
            PINKY: { state: 'STRAIGHT' },
            INDEX: { state: 'CURLED' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' }
        }
    },

    'Z': {
        name: 'Letter Z',
        description: "Index points (Motion required).",
        fingers: {
            INDEX: { state: 'STRAIGHT' },
            MIDDLE: { state: 'CURLED' },
            RING: { state: 'CURLED' },
            PINKY: { state: 'CURLED' }
        }
    },

    // --- NUMBERS ---
    '1': { fingers: { INDEX: 'STRAIGHT', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'CURLED' } },
    '2': { fingers: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'CURLED', PINKY: 'CURLED' } },
    '3': { fingers: { THUMB: 'STRAIGHT', INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'CURLED', PINKY: 'CURLED' } }, // ASL 3 includes thumb
    '4': { fingers: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'STRAIGHT', THUMB: 'CURLED' } },
    '5': { fingers: { THUMB: 'STRAIGHT', INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'STRAIGHT' } }
};
