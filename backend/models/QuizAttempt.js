import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true 
  },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpent: { type: Number, default: 0 }, // seconds per question
    pointsEarned: { type: Number, default: 0 }
  }],
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeSpent: { type: Number, required: true }, // total time in seconds
  completedAt: { type: Date, default: Date.now },
  passed: { type: Boolean, required: true },
  streak: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true 
  },
  category: { 
    type: String, 
    enum: ['alphabet', 'phrases', 'family', 'activities', 'advanced', 'mixed'],
    required: true 
  }
}, {
  timestamps: true
});

// Indexes for performance
quizAttemptSchema.index({ userId: 1, completedAt: -1 });
quizAttemptSchema.index({ quizId: 1, score: -1 });
quizAttemptSchema.index({ userId: 1, category: 1, difficulty: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);