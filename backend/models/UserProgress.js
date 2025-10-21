import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  learningPaths: [{
    learningPath: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningPath',
      required: true
    },
    currentUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    currentExercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    lastActiveAt: Date,
    completedAt: Date,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedUnits: [{
      unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit'
      },
      completedAt: Date,
      score: Number,
      xpEarned: Number,
      timeSpent: Number // in minutes
    }],
    completedLessons: [{
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      },
      completedAt: Date,
      score: Number,
      attempts: Number,
      xpEarned: Number,
      timeSpent: Number // in minutes
    }],
    completedExercises: [{
      exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
      },
      completedAt: Date,
      score: Number,
      attempts: Number,
      xpEarned: Number,
      timeSpent: Number, // in seconds
      accuracy: Number // percentage
    }],
    unlockedUnits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    }],
    unlockedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }]
  }],
  // Legacy curriculum support
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
    maxStreak: {
      type: Number,
      default: 0
    },
    lastActiveDate: Date,
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    totalExercisesCompleted: {
      type: Number,
      default: 0
    },
    totalLessonsCompleted: {
      type: Number,
      default: 0
    },
    totalUnitsCompleted: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    xpBonus: {
      type: Number,
      default: 0
    }
  }],
  dailyGoals: {
    target: {
      type: Number,
      default: 5 // exercises per day
    },
    current: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userProgressSchema.index({ user: 1 });
userProgressSchema.index({ 'learningPaths.learningPath': 1 });
userProgressSchema.index({ 'learningPaths.currentUnit': 1 });
userProgressSchema.index({ 'learningPaths.currentLesson': 1 });
userProgressSchema.index({ 'curriculum.currentUnit': 1 });
userProgressSchema.index({ 'curriculum.currentLesson': 1 });
userProgressSchema.index({ 'overall.lastActiveDate': 1 });

export default mongoose.model('UserProgress', userProgressSchema);