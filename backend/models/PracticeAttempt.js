import mongoose from 'mongoose';

const practiceAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign',
    required: true
  },
  expectedWord: {
    type: String,
    trim: true
  },
  imagePath: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  landmarks: {
    handShape: {
      type: String,
      enum: ['correct', 'needs_adjustment'],
      default: 'needs_adjustment'
    },
    position: {
      type: String,
      enum: ['correct', 'needs_adjustment'],
      default: 'needs_adjustment'
    },
    orientation: {
      type: String,
      enum: ['correct', 'needs_adjustment'],
      default: 'needs_adjustment'
    },
    movement: {
      type: String,
      enum: ['correct', 'needs_adjustment'],
      default: 'needs_adjustment'
    },
    timing: {
      type: String,
      enum: ['correct', 'needs_adjustment'],
      default: 'needs_adjustment'
    }
  },
  improvements: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

practiceAttemptSchema.index({ user: 1, sign: 1, createdAt: -1 });

export default mongoose.model('PracticeAttempt', practiceAttemptSchema);

