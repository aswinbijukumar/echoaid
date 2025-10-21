import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'feedback', 'bug-report', 'feature-request'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved', 'closed'],
    default: 'new'
  },
  isReadByAdmin: {
    type: Boolean,
    default: false
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  readAt: {
    type: Date
  },
  reply: {
    type: String,
    trim: true,
    maxlength: [2000, 'Reply cannot be more than 2000 characters']
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  repliedAt: {
    type: Date
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    platform: {
      type: String,
      enum: ['Mobile', 'Desktop', 'Tablet'],
      default: 'Desktop'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ status: 1, isReadByAdmin: 1 });
messageSchema.index({ category: 1, priority: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);