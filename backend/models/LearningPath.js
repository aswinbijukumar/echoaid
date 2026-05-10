import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a learning path title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a learning path description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  language: {
    type: String,
    default: 'Indian Sign Language',
    maxlength: [50, 'Language cannot be more than 50 characters']
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 20
  },
  totalUnits: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  totalExercises: {
    type: Number,
    default: 0
  },
  units: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath'
  }],
  unlockRequirements: {
    completedPaths: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningPath'
    }],
    minXP: {
      type: Number,
      default: 0
    },
    minLevel: {
      type: Number,
      default: 1
    }
  },
  coverImage: {
    type: String,
    required: [true, 'Please provide a cover image']
  },
  thumbnail: {
    type: String,
    required: [true, 'Please provide a thumbnail']
  },
  color: {
    type: String,
    default: 'bg-blue-500'
  },
  icon: {
    type: String,
    default: 'AcademicCapIcon'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  stats: {
    totalEnrollments: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
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
learningPathSchema.index({ difficulty: 1, isActive: 1, isPublished: 1 });
learningPathSchema.index({ createdBy: 1 });
learningPathSchema.index({ tags: 1 });

export default mongoose.model('LearningPath', learningPathSchema);
