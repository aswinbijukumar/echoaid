import mongoose from 'mongoose';

const signSchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Please provide a word'],
    trim: true,
    maxlength: [100, 'Word cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['alphabet', 'phrases', 'family', 'activities', 'advanced', 'numbers'],
    default: 'alphabet'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  // File paths for images and videos
  imagePath: {
    type: String,
    required: [true, 'Please provide an image path']
  },
  thumbnailPath: {
    type: String,
    required: [true, 'Please provide a thumbnail path']
  },
  videoPath: {
    type: String,
    default: null
  },
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  usage: {
    type: String,
    maxlength: [200, 'Usage cannot be more than 200 characters']
  },
  // Learning statistics
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    practiceCount: { type: Number, default: 0 }
  },
  // Related signs
  relatedSigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  // Audio pronunciation (future feature)
  audioPath: {
    type: String,
    default: null
  },
  // Sign language type (ASL, BSL, etc.)
  signLanguageType: {
    type: String,
    enum: ['ASL', 'BSL', 'AUSLAN', 'ISL'],
    default: 'ASL'
  },
  // Hand dominance
  handDominance: {
    type: String,
    enum: ['right', 'left', 'both'],
    default: 'right'
  },
  // Facial expressions required
  facialExpression: {
    type: String,
    maxlength: [100, 'Facial expression cannot be more than 100 characters']
  },
  // Body position
  bodyPosition: {
    type: String,
    maxlength: [100, 'Body position cannot be more than 100 characters']
  },
  // Movement description
  movement: {
    type: String,
    maxlength: [200, 'Movement description cannot be more than 200 characters']
  },
  // Is active/published
  isActive: {
    type: Boolean,
    default: true
  },
  // Created by (admin reference)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
signSchema.index({ word: 1, category: 1 });
signSchema.index({ category: 1, difficulty: 1 });
signSchema.index({ tags: 1 });
signSchema.index({ 'stats.views': -1 });

// Virtual for full image URL
signSchema.virtual('imageUrl').get(function() {
  return `/api/dictionary/signs/${this.category}/${this.imagePath.split('/').pop()}`;
});

// Virtual for thumbnail URL
signSchema.virtual('thumbnailUrl').get(function() {
  return `/api/dictionary/signs/${this.category}/${this.thumbnailPath.split('/').pop()}?width=200&height=200&quality=80`;
});

// Ensure virtuals are included in JSON
signSchema.set('toJSON', { virtuals: true });
signSchema.set('toObject', { virtuals: true });

export default mongoose.model('Sign', signSchema); 