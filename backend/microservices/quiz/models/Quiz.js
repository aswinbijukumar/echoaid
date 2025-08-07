import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    maxlength: [500, 'Question cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'matching', 'fill-blank'],
    default: 'multiple-choice'
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    explanation: {
      type: String,
      maxlength: [200, 'Explanation cannot be more than 200 characters']
    }
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Please provide the correct answer']
  },
  explanation: {
    type: String,
    maxlength: [300, 'Explanation cannot be more than 300 characters']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  points: {
    type: Number,
    default: 10
  },
  // Reference to sign if question is about a specific sign
  signReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  },
  // Image or video for the question
  mediaUrl: {
    type: String
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: ['alphabet', 'phrases', 'family', 'activities', 'advanced', 'mixed'],
    default: 'mixed'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 10
  },
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Statistics
  stats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  // Created by (admin reference)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
quizSchema.index({ category: 1, difficulty: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ 'stats.totalAttempts': -1 });

export default mongoose.model('Quiz', quizSchema); 