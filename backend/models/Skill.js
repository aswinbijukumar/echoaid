import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a skill title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a skill description'],
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  category: {
    type: String,
    enum: ['basics', 'alphabet', 'phrases', 'family', 'activities', 'advanced'],
    required: true
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  order: {
    type: Number,
    required: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  unlockRequirements: {
    completedSkills: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
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
  signs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  targetSign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
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
skillSchema.index({ category: 1, order: 1 });
skillSchema.index({ level: 1 });
skillSchema.index({ isActive: 1 });

export default mongoose.model('Skill', skillSchema);