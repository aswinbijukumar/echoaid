import mongoose from 'mongoose';

const questionBankSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true,
    maxlength: [500, 'Question cannot be more than 500 characters']
  },
  type: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'matching', 'fill-blank', 'sign-recognition'], 
    default: 'multiple-choice' 
  },
  options: [{
    text: { 
      type: String, 
      required: true,
      maxlength: [200, 'Option text cannot be more than 200 characters']
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
    required: true 
  },
  explanation: { 
    type: String, 
    maxlength: [300, 'Explanation cannot be more than 300 characters']
  },
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['alphabet', 'phrases', 'family', 'activities', 'advanced'], 
    required: true 
  },
  tags: [{ 
    type: String, 
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  mediaUrl: { 
    type: String 
  },
  signReference: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sign' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  successRate: { 
    type: Number, 
    default: 0 
  },
  averageTime: { 
    type: Number, 
    default: 0 
  },
  points: { 
    type: Number, 
    default: 10 
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
questionBankSchema.index({ category: 1, difficulty: 1, isActive: 1 });
questionBankSchema.index({ createdBy: 1, isActive: 1 });
questionBankSchema.index({ tags: 1 });
questionBankSchema.index({ successRate: -1 });
questionBankSchema.index({ usageCount: -1 });

export default mongoose.model('QuestionBank', questionBankSchema);