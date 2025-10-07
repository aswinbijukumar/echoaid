import mongoose from 'mongoose';

const userAchievementSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  achievementId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Achievement', 
    required: true 
  },
  unlockedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 }, // for progressive achievements (0-100)
  isCompleted: { type: Boolean, default: false },
  xpEarned: { type: Number, default: 0 },
  notificationSent: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, unlockedAt: -1 });
userAchievementSchema.index({ achievementId: 1, isCompleted: 1 });

export default mongoose.model('UserAchievement', userAchievementSchema);