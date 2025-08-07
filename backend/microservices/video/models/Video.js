import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a video title'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  // File information
  filePath: {
    type: String,
    required: [true, 'Please provide video file path']
  },
  thumbnailPath: {
    type: String,
    required: [true, 'Please provide thumbnail path']
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  format: {
    type: String,
    enum: ['mp4', 'webm', 'avi', 'mov'],
    default: 'mp4'
  },
  quality: {
    type: String,
    enum: ['360p', '480p', '720p', '1080p', '4K'],
    default: '720p'
  },
  // Content categorization
  category: {
    type: String,
    enum: ['tutorial', 'lesson', 'practice', 'story', 'news', 'entertainment'],
    default: 'tutorial'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Related signs
  relatedSigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  // Creator information
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Video statistics
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  // Video status
  status: {
    type: String,
    enum: ['processing', 'ready', 'published', 'private', 'archived'],
    default: 'processing'
  },
  // Accessibility features
  hasSubtitles: {
    type: Boolean,
    default: false
  },
  subtitlePath: {
    type: String
  },
  hasAudioDescription: {
    type: Boolean,
    default: false
  },
  audioDescriptionPath: {
    type: String
  },
  // Language
  language: {
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
    default: 'English'
  },
  // Sign language type
  signLanguageType: {
    type: String,
    enum: ['ASL', 'BSL', 'AUSLAN', 'ISL'],
    default: 'ASL'
  },
  // Video metadata
  metadata: {
    resolution: String,
    frameRate: Number,
    bitrate: Number,
    codec: String
  },
  // Thumbnails at different sizes
  thumbnails: {
    small: String,
    medium: String,
    large: String
  },
  // Processing information
  processing: {
    isProcessed: { type: Boolean, default: false },
    processingStarted: Date,
    processingCompleted: Date,
    error: String
  }
}, {
  timestamps: true
});

// Indexes
videoSchema.index({ category: 1, difficulty: 1 });
videoSchema.index({ creator: 1, createdAt: -1 });
videoSchema.index({ status: 1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ 'stats.views': -1 });

// Virtual for video URL
videoSchema.virtual('videoUrl').get(function() {
  return `/api/video/stream/${this._id}`;
});

// Virtual for thumbnail URL
videoSchema.virtual('thumbnailUrl').get(function() {
  return `/api/video/thumbnail/${this._id}`;
});

// Ensure virtuals are included in JSON
videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

export default mongoose.model('Video', videoSchema); 