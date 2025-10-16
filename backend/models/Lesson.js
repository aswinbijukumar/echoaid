import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 10
  },
  objectives: [{
    type: String,
    maxlength: [200, 'Objective cannot be more than 200 characters']
  }],
  signs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  exercises: [{
    type: {
      type: String,
      enum: ['sign-recognition', 'sign-production', 'translation', 'matching', 'fill-blank'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean,
      explanation: String
    }],
    correctAnswer: String,
    explanation: String,
    points: {
      type: Number,
      default: 10
    },
    mediaUrl: String,
    targetSign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sign'
    }
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  unlockRequirements: {
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    minAccuracy: {
      type: Number,
      default: 0
    }
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
lessonSchema.index({ unit: 1, order: 1 });
lessonSchema.index({ level: 1 });
lessonSchema.index({ isActive: 1 });

export default mongoose.model('Lesson', lessonSchema);