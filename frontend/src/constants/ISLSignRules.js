/**
 * ISLSignRules.js
 * 
 * Defines the geometric "Gold Standard" for **Indian Sign Language (ISL)**.
 * Based on authentic reference rules (Numbers 0-9, Alphabet A-Z).
 */

export const ISL_SIGN_RULES = {
    // --- NUMBERS (0-9) ---
    '0': {
        name: 'Number 0',
        description: "All fingers closed into a circle.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { THUMB: 'CURLED', INDEX: 'CURLED', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'DOMINANT_THUMB', part2: 'TIP', maxDistance: 0.05, message: "Close the circle (Index touching Thumb)" }
        ]
    },
    '1': {
        name: 'Number 1',
        description: "Index straight up, others closed.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { THUMB: 'CURLED', INDEX: 'STRAIGHT', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'CURLED' }
        }
    },
    '2': {
        name: 'Number 2',
        description: "Index and Middle straight up (V shape).",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'CURLED', PINKY: 'CURLED' }
        }
    },
    '3': {
        name: 'Number 3',
        description: "Index, Middle, Ring straight up.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'CURLED', THUMB: 'CURLED' }
        }
    },
    '4': {
        name: 'Number 4',
        description: "Four fingers up, thumb tucked.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'STRAIGHT', THUMB: 'CURLED' }
        }
    },
    '5': {
        name: 'Number 5',
        description: "All five fingers spread.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { THUMB: 'STRAIGHT', INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'STRAIGHT' }
        }
    },
    '6': {
        name: 'Number 6',
        description: "Only pinky straight up.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'CURLED', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'STRAIGHT', THUMB: 'CURLED' }
        }
    },
    '7': {
        name: 'Number 7',
        description: "Index finger hooked.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'CURLED', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'CURLED' }
        }
    },
    '8': {
        name: 'Number 8',
        description: "Thumb, Index, Middle up.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { THUMB: 'STRAIGHT', INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'CURLED', PINKY: 'CURLED' }
        }
    },
    '9': {
        name: 'Number 9',
        description: "Thumb and Pinky up (Call me).",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { THUMB: 'STRAIGHT', INDEX: 'CURLED', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'STRAIGHT' }
        }
    },

    // --- ALPHABET (A-Z) ---
    'A': {
        name: 'Letter A',
        description: "Touch tips of both thumbs.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { THUMB: 'STRAIGHT', INDEX: 'CURLED' },
            BASE: { THUMB: 'STRAIGHT', INDEX: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_THUMB', part1: 'TIP', p2: 'BASE_THUMB', part2: 'TIP', maxDistance: 0.08, message: "Touch your two thumb tips together" }
        ]
    },
    'B': {
        name: 'Letter B',
        description: "Both hands form circles (Ok sign) and join.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'CURLED', THUMB: 'CURLED' },
            BASE: { INDEX: 'CURLED', THUMB: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_INDEX', part2: 'TIP', maxDistance: 0.08, message: "Touch index finger circles together" }
        ]
    },
    'C': {
        name: 'Letter C',
        description: "Curve hand into C shape.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'CURLED', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'CURLED', THUMB: 'CURLED' }
        }
    },
    'D': {
        name: 'Letter D',
        description: "Dominant index/thumb circle touches base vertical index.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { INDEX: 'STRAIGHT' }, // Vertical index line
            DOMINANT: { INDEX: 'CURLED', THUMB: 'CURLED' } // The 'loop'
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_INDEX', part2: 'TIP', maxDistance: 0.1, message: "Touch loop to top of vertical finger" }
        ]
    },
    'E': {
        name: 'Letter E',
        description: "Point index into small C.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT' },
            BASE: { INDEX: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_INDEX', part2: 'TIP', maxDistance: 0.1, message: "Point finger into the C shape" }
        ]
    },
    'F': {
        name: 'Letter F',
        description: "Cross index/middle fingers.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT' },
            BASE: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'MCP', p2: 'BASE_INDEX', part2: 'MCP', maxDistance: 0.15, message: "Cross your two fingers on top" }
        ]
    },
    'G': {
        name: 'Letter G',
        description: "Two fists stacked.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'CURLED', THUMB: 'CURLED' },
            BASE: { INDEX: 'CURLED', THUMB: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_THUMB', part1: 'MCP', p2: 'BASE_THUMB', part2: 'MCP', maxDistance: 0.2, message: "Stack fists on top of each other" }
        ]
    },
    'H': {
        name: 'Letter H',
        description: "Dominant palm wipes vertical base fingers.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT' },
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_PALM', part1: 'CENTER', p2: 'BASE_INDEX', part2: 'MCP', maxDistance: 0.15, message: "Wipe hand across vertical fingers" }
        ]
    },
    'I': {
        name: 'Letter I',
        description: "Index straight up (Same as 1).",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'CURLED' }
        }
    },
    'J': {
        name: 'Letter J',
        description: "Point to tip of L shape.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { INDEX: 'STRAIGHT', THUMB: 'STRAIGHT' }, // L shape
            DOMINANT: { INDEX: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_INDEX', part2: 'TIP', maxDistance: 0.1, message: "Touch tip of the L shape" }
        ]
    },
    'K': {
        name: 'Letter K',
        description: "Hook finger onto vertical index.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { INDEX: 'STRAIGHT' },
            DOMINANT: { INDEX: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_INDEX', part2: 'PIP', maxDistance: 0.08, message: "Hook finger onto the straight index joint" }
        ]
    },
    'L': {
        name: 'Letter L',
        description: "L Shape (Index and Thumb) Single Hand.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', THUMB: 'STRAIGHT', MIDDLE: 'CURLED' }
        }
    },
    'M': {
        name: 'Letter M',
        description: "Three fingers on palm.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'CURLED' },
            BASE: { THUMB: 'STRAIGHT', INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_MIDDLE', part1: 'TIP', p2: 'BASE_PALM', part2: 'CENTER', maxDistance: 0.15, message: "Place 3 fingers ON palm" }
        ]
    },
    'N': {
        name: 'Letter N',
        description: "Two fingers on palm.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'CURLED' },
            BASE: { THUMB: 'STRAIGHT', INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'STRAIGHT', PINKY: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_PALM', part2: 'CENTER', maxDistance: 0.15, message: "Place 2 fingers ON palm" }
        ]
    },
    'O': {
        name: 'Letter O',
        description: "Fingertips touching thumb tip.",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'CURLED', MIDDLE: 'CURLED', RING: 'CURLED', PINKY: 'CURLED', THUMB: 'CURLED' }
        }
    },
    'P': {
        name: 'Letter P',
        description: "Index/Thumb pinch vertical index.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { INDEX: 'STRAIGHT' },
            DOMINANT: { INDEX: 'CURLED', THUMB: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_THUMB', part1: 'TIP', p2: 'BASE_INDEX', part2: 'PIP', maxDistance: 0.1, message: "Pinch the vertical finger" }
        ]
    },
    'Q': {
        name: 'Letter Q',
        description: "Hook finger through O.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { INDEX: 'CURLED', THUMB: 'CURLED' }, // The O
            DOMINANT: { INDEX: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_INDEX', part2: 'TIP', maxDistance: 0.1, message: "Hook inside the circle" }
        ]
    },
    'R': {
        name: 'Letter R',
        description: "Finger hooked on palm.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'CURLED' },
            BASE: { THUMB: 'STRAIGHT' } // Open palm
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'TIP', p2: 'BASE_PALM', part2: 'CENTER', maxDistance: 0.15, message: "Hook finger onto palm center" }
        ]
    },
    'S': {
        name: 'Letter S',
        description: "Pinkies interlocked.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { PINKY: 'CURLED' },
            BASE: { PINKY: 'CURLED' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_PINKY', part1: 'TIP', p2: 'BASE_PINKY', part2: 'TIP', maxDistance: 0.08, message: "Link your pinky fingers" }
        ]
    },
    'T': {
        name: 'Letter T',
        description: "Index across Top of vertical index.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { INDEX: 'STRAIGHT' },
            DOMINANT: { INDEX: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'MCP', p2: 'BASE_INDEX', part2: 'TIP', maxDistance: 0.1, message: "Form a T shape on top" }
        ]
    },
    'U': {
        name: 'Letter U',
        description: "Horns/Rock on (Index + Pinky).",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', PINKY: 'STRAIGHT', MIDDLE: 'CURLED', RING: 'CURLED' }
        }
    },
    'V': {
        name: 'Letter V',
        description: "V Shape (Index + Middle).",
        type: 'SINGLE_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT', MIDDLE: 'STRAIGHT', RING: 'CURLED' }
        }
    },
    'W': {
        name: 'Letter W',
        description: "Interlaced fingers.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { MIDDLE: 'STRAIGHT' },
            BASE: { MIDDLE: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_MIDDLE', part1: 'MCP', p2: 'BASE_MIDDLE', part2: 'MCP', maxDistance: 0.1, message: "Clasp hands together (Interlace)" }
        ]
    },
    'X': {
        name: 'Letter X',
        description: "Crossed Index fingers.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { INDEX: 'STRAIGHT' },
            BASE: { INDEX: 'STRAIGHT' }
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_INDEX', part1: 'MCP', p2: 'BASE_INDEX', part2: 'MCP', maxDistance: 0.1, message: "Cross index fingers like X" }
        ]
    },
    'Y': {
        name: 'Letter Y',
        description: "Thumb points to palm center.",
        type: 'TWO_HANDED',
        fingers: {
            DOMINANT: { THUMB: 'STRAIGHT', PINKY: 'STRAIGHT' },
            BASE: { THUMB: 'STRAIGHT' } // Open palm
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_THUMB', part1: 'TIP', p2: 'BASE_PALM', part2: 'CENTER', maxDistance: 0.15, message: "Point thumb to palm center" }
        ]
    },
    'Z': {
        name: 'Letter Z',
        description: "Edge of hand on palm.",
        type: 'TWO_HANDED',
        fingers: {
            BASE: { THUMB: 'STRAIGHT' }, // Open palm
            DOMINANT: { PINKY: 'STRAIGHT' } // Flat hand
        },
        geometry: [
            { type: 'DISTANCE', p1: 'DOMINANT_PINKY', part1: 'MCP', p2: 'BASE_PALM', part2: 'CENTER', maxDistance: 0.15, message: "Place edge of hand on palm" }
        ]
    }
};
