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
  // Cover image (main image shown in dictionary)
  coverImage: {
    type: String,
    required: [true, 'Please provide a cover image']
  },
  coverThumbnail: {
    type: String,
    required: [true, 'Please provide a cover thumbnail']
  },
  // Multiple variants for learning from different angles
  variants: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    path: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      default: null
    },
    description: {
      type: String,
      maxlength: [200, 'Variant description cannot be more than 200 characters']
    },
    angle: {
      type: String,
      enum: ['front', 'side', 'back', 'close-up', 'slow', 'fast', 'demo'],
      default: 'front'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // Legacy fields for backward compatibility
  imagePath: {
    type: String,
    default: null
  },
  thumbnailPath: {
    type: String,
    default: null
  },
  videoPath: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  usage: {
    type: String,
    maxlength: [200, 'Usage cannot be more than 200 characters']
  },
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    practiceCount: { type: Number, default: 0 }
  },
  relatedSigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  audioPath: {
    type: String,
    default: null
  },
  signLanguageType: {
    type: String,
    enum: ['ASL', 'BSL', 'AUSLAN', 'ISL'],
    default: 'ASL'
  },
  handDominance: {
    type: String,
    enum: ['right', 'left', 'both'],
    default: 'right'
  },
  facialExpression: {
    type: String,
    maxlength: [100, 'Facial expression cannot be more than 100 characters']
  },
  bodyPosition: {
    type: String,
    maxlength: [100, 'Body position cannot be more than 100 characters']
  },
  movement: {
    type: String,
    maxlength: [200, 'Movement description cannot be more than 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

signSchema.index({ word: 1, category: 1 });
signSchema.index({ category: 1, difficulty: 1 });
signSchema.index({ tags: 1 });
signSchema.index({ 'stats.views': -1 });

function deriveCategoryFromPath(p) {
  if (!p) return null;
  const parts = p.split('/').filter(Boolean);
  const idx = parts.findIndex(seg => seg === 'signs');
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

signSchema.virtual('imageUrl').get(function() {
  const fileName = this.imagePath ? this.imagePath.split('/').pop() : '';
  const actualCategory = deriveCategoryFromPath(this.imagePath) || this.category;
  return `/api/dictionary/signs/${actualCategory}/${fileName}`;
});

signSchema.virtual('thumbnailUrl').get(function() {
  const fileName = this.thumbnailPath ? this.thumbnailPath.split('/').pop() : (this.imagePath ? this.imagePath.split('/').pop() : '');
  const actualCategory = deriveCategoryFromPath(this.thumbnailPath) || deriveCategoryFromPath(this.imagePath) || this.category;
  return `/api/dictionary/signs/${actualCategory}/${fileName}?width=200&height=200&quality=80`;
});

signSchema.set('toJSON', { virtuals: true });
signSchema.set('toObject', { virtuals: true });

export default mongoose.model('Sign', signSchema);

