import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a unit title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a unit description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  order: {
    type: Number,
    required: true,
    unique: true
  },
  icon: {
    type: String,
    default: 'AcademicCapIcon'
  },
  color: {
    type: String,
    default: 'bg-blue-500'
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  }],
  unlockRequirements: {
    completedUnits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
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
  estimatedDuration: {
    type: Number, // in minutes
    default: 30
  },
  xpReward: {
    type: Number,
    default: 100
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
unitSchema.index({ order: 1 });
unitSchema.index({ level: 1 });
unitSchema.index({ isActive: 1 });

export default mongoose.model('Unit', unitSchema);