import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a skill title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a skill description'],
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  category: {
    type: String,
    enum: ['basics', 'alphabet', 'numbers', 'phrases', 'family', 'activities', 'advanced'],
    required: true
  },
  level: {
    type: Number,
    default: 0,
    min: 0
  },
  order: {
    type: Number,
    required: true
  },
  // Learning Module Structure
  moduleType: {
    type: String,
    enum: ['flashcards', 'quiz', 'mixed'],
    default: 'flashcards'
  },
  // Visual Flashcards Structure
  flashcards: [{
    _id: false,
    word: {
      type: String,
      required: true,
      trim: true
    },
    meaning: {
      type: String,
      required: true,
      trim: true
    },
    imagePath: {
      type: String,
      default: ''
    },
    additionalImages: [{
      type: String
    }],
    videoPath: {
      type: String
    },
    audioPath: {
      type: String
    },
    generatedAudio: {
      text: {
        type: String
      },
      audioText: {
        type: String
      }
    }
  }],
  // Quiz Mode Structure
  quizQuestions: [{
    _id: false,
    questionType: {
      type: String,
      enum: ['image-to-word', 'word-to-image', 'audio-to-image'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    correctAnswer: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    imagePath: {
      type: String
    },
    audioPath: {
      type: String
    },
    explanation: {
      type: String
    }
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  unlockRequirements: {
    completedSkills: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }],
    minLevel: {
      type: Number,
      default: 1
    },
    minXP: {
      type: Number,
      default: 0
    }
  },
  signs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  targetSign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  },
  xpReward: {
    type: Number,
    default: 20
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
skillSchema.index({ category: 1, order: 1 });
skillSchema.index({ level: 1 });
skillSchema.index({ isActive: 1 });

export default mongoose.model('Skill', skillSchema);