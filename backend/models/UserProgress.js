import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  curriculum: {
    currentUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedUnits: [{
      unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit'
      },
      completedAt: Date,
      score: Number,
      xpEarned: Number
    }],
    completedLessons: [{
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      },
      completedAt: Date,
      score: Number,
      attempts: Number,
      xpEarned: Number
    }],
    unlockedUnits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    }],
    unlockedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }]
  },
  overall: {
    totalXP: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActiveDate: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
userProgressSchema.index({ user: 1 });
userProgressSchema.index({ 'curriculum.currentUnit': 1 });
userProgressSchema.index({ 'curriculum.currentLesson': 1 });

export default mongoose.model('UserProgress', userProgressSchema);