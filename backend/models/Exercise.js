import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an exercise title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  type: {
    type: String,
    enum: [
      'video-tutorial',
      'sign-recognition',
      'sign-production',
      'translation',
      'matching',
      'fill-blank',
      'multiple-choice',
      'true-false',
      'sequence',
      'pronunciation'
    ],
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  content: {
    question: {
      type: String,
      required: [true, 'Please provide a question']
    },
    instruction: {
      type: String,
      maxlength: [200, 'Instruction cannot be more than 200 characters']
    },
    mediaUrl: {
      type: String // Video, image, or audio URL
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio', 'none'],
      default: 'none'
    },
    correctAnswer: {
      type: String,
      required: [true, 'Please provide the correct answer']
    },
    options: [{
      text: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        default: false
      },
      explanation: {
        type: String,
        maxlength: [200, 'Explanation cannot be more than 200 characters']
      },
      mediaUrl: String
    }],
    explanation: {
      type: String,
      maxlength: [500, 'Explanation cannot be more than 500 characters']
    },
    hints: [{
      type: String,
      maxlength: [200, 'Hint cannot be more than 200 characters']
    }],
    sampleAnswer: {
      type: String,
      maxlength: [200, 'Sample answer cannot be more than 200 characters']
    }
  },
  targetSign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  },
  relatedSigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  timeLimit: {
    type: Number, // in seconds, 0 means no limit
    default: 0
  },
  attempts: {
    type: Number,
    default: 3 // Maximum attempts allowed
  },
  xpReward: {
    type: Number,
    default: 10
  },
  points: {
    type: Number,
    default: 10
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

// Indexes for efficient queries
exerciseSchema.index({ lesson: 1, order: 1 });
exerciseSchema.index({ type: 1, difficulty: 1 });
exerciseSchema.index({ targetSign: 1 });
exerciseSchema.index({ isActive: 1 });

export default mongoose.model('Exercise', exerciseSchema);
