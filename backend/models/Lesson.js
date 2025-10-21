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
  shortDescription: {
    type: String,
    maxlength: [150, 'Short description cannot be more than 150 characters']
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
  learningObjectives: [{
    type: String,
    maxlength: [200, 'Objective cannot be more than 200 characters']
  }],
  signs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  exercises: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  }],
  totalExercises: {
    type: Number,
    default: 0
  },
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
    },
    minXP: {
      type: Number,
      default: 0
    }
  },
  xpReward: {
    type: Number,
    default: 20
  },
  coverImage: {
    type: String
  },
  thumbnail: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  stats: {
    totalCompletions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 }
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
lessonSchema.index({ level: 1, isActive: 1, isPublished: 1 });
lessonSchema.index({ createdBy: 1 });

export default mongoose.model('Lesson', lessonSchema);