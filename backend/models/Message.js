import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // User who sent the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Admin who will receive/reply to the message
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message content
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Message status
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Category for better organization
  category: {
    type: String,
    enum: ['technical', 'billing', 'learning', 'account', 'general'],
    default: 'general'
  },
  
  // Admin reply
  adminReply: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // Timestamps
  repliedAt: {
    type: Date
  },
  
  // Read status
  isReadByAdmin: {
    type: Boolean,
    default: false
  },
  
  isReadByUser: {
    type: Boolean,
    default: true // User knows they sent it
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, status: 1 });
messageSchema.index({ status: 1, priority: 1 });

// Virtual for message age
messageSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Ensure virtual fields are serialized
messageSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Message', messageSchema);
