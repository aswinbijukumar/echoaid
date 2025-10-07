import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    maxlength: [100, 'Achievement name cannot be more than 100 characters']
  },
  description: { 
    type: String, 
    required: true,
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  icon: { 
    type: String, 
    required: true,
    default: '🏆'
  },
  category: { 
    type: String, 
    enum: ['quiz', 'streak', 'learning', 'social', 'speed', 'accuracy'], 
    required: true 
  },
  requirements: {
    type: { 
      type: String, 
      enum: ['score', 'streak', 'completion', 'speed', 'accuracy', 'level', 'xp', 'time'], 
      required: true 
    },
    value: { type: Number, required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    category: { 
      type: String, 
      enum: ['alphabet', 'phrases', 'family', 'activities', 'advanced', 'mixed'] 
    },
    timeframe: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'all-time'],
      default: 'all-time'
    }
  },
  xpReward: { type: Number, default: 0 },
  badge: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isSecret: { type: Boolean, default: false }, // Hidden until unlocked
  rarity: { 
    type: String, 
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ 'requirements.type': 1, 'requirements.value': 1 });

export default mongoose.model('Achievement', achievementSchema);