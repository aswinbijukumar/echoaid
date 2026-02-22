/**
 * SignDictionary.js
 * 
 * Central repository for Sign Language metadata.
 * Shared between Learning, Practice, and Arcade modules.
 */

export const SIGN_DICTIONARY = {
    'A': {
        name: 'Letter A',
        description: 'Make a fist with your thumb extended upward alongside the index finger.',
        usage: 'Used in spelling words.',
        difficulty: 'Beginner',
        category: 'Alphabet',
        tips: ['Keep your thumb straight up', 'Tuck fingers tightly'],
        commonMistakes: ['Thumb sticking out too far', 'Fist too loose'],
        xpValue: 10
    },
    'B': {
        name: 'Letter B',
        description: 'Hold hand flat, thumb tucked into palm.',
        usage: 'Used in spelling.',
        difficulty: 'Beginner',
        category: 'Alphabet',
        tips: ['Keep fingers together', 'Tuck thumb firmly'],
        xpValue: 10
    },
    'C': {
        name: 'Letter C',
        description: 'Form a C shape with hand.',
        usage: 'Used in spelling.',
        difficulty: 'Beginner',
        category: 'Alphabet',
        tips: ['Keep fingers curved', 'Make a nice round shape'],
        xpValue: 10
    },
    'D': {
        name: 'Letter D',
        description: 'Index up, others circle with thumb.',
        usage: 'Used in spelling.',
        difficulty: 'Beginner',
        category: 'Alphabet',
        tips: ['Index straight up', 'Circle must be closed'],
        xpValue: 10
    },
    'E': {
        name: 'Letter E',
        description: 'Fingers curled onto thumb.',
        difficulty: 'Beginner',
        category: 'Alphabet',
        tips: ['Don\'t squeeze too hard', 'Show fingernails'],
        xpValue: 10
    },
    // ... Extend as needed, simplified for this implementation
    'F': { name: 'Letter F', xpValue: 10, category: 'Alphabet' },
    'G': { name: 'Letter G', xpValue: 10, category: 'Alphabet' },
    'H': { name: 'Letter H', xpValue: 10, category: 'Alphabet' },
    'I': { name: 'Letter I', xpValue: 10, category: 'Alphabet' },
    'J': { name: 'Letter J', xpValue: 15, category: 'Alphabet' },
    'K': { name: 'Letter K', xpValue: 15, category: 'Alphabet' },
    'L': { name: 'Letter L', xpValue: 10, category: 'Alphabet' },
    'M': { name: 'Letter M', xpValue: 15, category: 'Alphabet' },
    'N': { name: 'Letter N', xpValue: 15, category: 'Alphabet' },
    'O': { name: 'Letter O', xpValue: 10, category: 'Alphabet' },
    'P': { name: 'Letter P', xpValue: 15, category: 'Alphabet' },
    'Q': { name: 'Letter Q', xpValue: 15, category: 'Alphabet' },
    'R': { name: 'Letter R', xpValue: 15, category: 'Alphabet' },
    'S': { name: 'Letter S', xpValue: 10, category: 'Alphabet' },
    'T': { name: 'Letter T', xpValue: 15, category: 'Alphabet' },
    'U': { name: 'Letter U', xpValue: 15, category: 'Alphabet' },
    'V': { name: 'Letter V', xpValue: 10, category: 'Alphabet' },
    'W': { name: 'Letter W', xpValue: 15, category: 'Alphabet' },
    'X': { name: 'Letter X', xpValue: 15, category: 'Alphabet' },
    'Y': { name: 'Letter Y', xpValue: 15, category: 'Alphabet' },
    'Z': { name: 'Letter Z', xpValue: 20, category: 'Alphabet' },

    // Numbers
    '1': { name: 'Number 1', xpValue: 10, category: 'Numbers' },
    '2': { name: 'Number 2', xpValue: 10, category: 'Numbers' },
    '3': { name: 'Number 3', xpValue: 10, category: 'Numbers' },
    '4': { name: 'Number 4', xpValue: 10, category: 'Numbers' },
    '5': { name: 'Number 5', xpValue: 10, category: 'Numbers' }
};
