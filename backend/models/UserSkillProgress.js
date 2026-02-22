import mongoose from 'mongoose';

const userSkillProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    isUnlocked: {
      type: Boolean,
      default: false
    },
    isRelearning: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    lastPracticed: Date,
    totalXP: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    }
  }],
  daily: {
    goal: {
      type: Number,
      default: 20
    },
    progress: {
      type: Number,
      default: 0
    },
    lastActiveDate: Date
  },
  hearts: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  gems: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: Date
}, {
  timestamps: true
});

// Index for efficient queries

userSkillProgressSchema.index({ 'skills.skill': 1 });
userSkillProgressSchema.index({ lastActiveDate: 1 });

export default mongoose.model('UserSkillProgress', userSkillProgressSchema);