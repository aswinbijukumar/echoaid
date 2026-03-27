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
    required: false
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
    modelLabel: String,
    bbox: [Number],
    keypoints: [mongoose.Schema.Types.Mixed],
    predictions: [mongoose.Schema.Types.Mixed],
    modelSource: String,
    // Add legacy fields back but optional for compatibility
    handShape: { type: String, default: 'needs_adjustment' },
    position: { type: String, default: 'needs_adjustment' },
    orientation: { type: String, default: 'needs_adjustment' },
    movement: { type: String, default: 'needs_adjustment' },
    timing: { type: String, default: 'needs_adjustment' }
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

