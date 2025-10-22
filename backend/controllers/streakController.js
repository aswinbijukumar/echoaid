import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import UserSkillProgress from '../models/UserSkillProgress.js';
import logger from '../utils/prettyLogger.js';

/**
 * Update user streak based on activity completion
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity ('quiz', 'skill', 'practice')
 * @param {number} xpEarned - XP earned from the activity
 * @returns {Promise<Object>} Updated streak information
 */
export const updateUserStreak = async (userId, activityType, xpEarned = 0) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Initialize learning stats if not exists
    if (!user.learningStats) {
      user.learningStats = {
        streak: 0,
        longestStreak: 0,
        totalXP: 0,
        level: 1,
        xpToNextLevel: 100,
        signsLearned: 0,
        averageAccuracy: 0,
        lastPracticeDate: null
      };
    }

    const currentStreak = user.learningStats.streak || 0;
    const lastPracticeDate = user.learningStats.lastPracticeDate;
    
    let newStreak = currentStreak;
    let streakMessage = '';
    let milestoneAchieved = false;

    // Check if user has already practiced today
    const hasPracticedToday = lastPracticeDate && 
      new Date(lastPracticeDate).setHours(0, 0, 0, 0) === today.getTime();

    if (!hasPracticedToday) {
      // Check if this is consecutive day practice
      if (lastPracticeDate) {
        const lastPracticeDay = new Date(lastPracticeDate);
        lastPracticeDay.setHours(0, 0, 0, 0);
        
        if (lastPracticeDay.getTime() === yesterday.getTime()) {
          // Consecutive day - increment streak
          newStreak = currentStreak + 1;
          streakMessage = `🔥 Day ${newStreak} streak! Keep it up!`;
        } else if (lastPracticeDay.getTime() < yesterday.getTime()) {
          // Gap in practice - reset streak
          newStreak = 1;
          streakMessage = '🌱 New streak started! Welcome back!';
        } else {
          // Same day - maintain streak
          newStreak = currentStreak;
          streakMessage = '💪 Great job maintaining your streak!';
        }
      } else {
        // First time practicing
        newStreak = 1;
        streakMessage = '🎉 First day of your learning streak!';
      }

      // Check for milestone achievements
      const milestones = [1, 3, 7, 14, 30, 60, 100, 365];
      if (milestones.includes(newStreak)) {
        milestoneAchieved = true;
        const milestoneMessages = {
          1: "🔥 Great start! You're on fire!",
          3: "🎯 3 days strong! You're building momentum!",
          7: "🌟 Amazing! One week streak achieved!",
          14: "💪 Two weeks! You're unstoppable!",
          30: "🏆 Incredible! One month streak!",
          60: "🚀 Outstanding! Two months of dedication!",
          100: "👑 Legendary! 100 days of excellence!",
          365: "🎊 PHENOMENAL! One year streak achieved!"
        };
        streakMessage = milestoneMessages[newStreak] || streakMessage;
      }

      // Update user stats
      user.learningStats.streak = newStreak;
      user.learningStats.longestStreak = Math.max(
        user.learningStats.longestStreak || 0, 
        newStreak
      );
      user.learningStats.totalXP = (user.learningStats.totalXP || 0) + xpEarned;
      user.learningStats.lastPracticeDate = new Date();
      
      // Update level based on total XP
      const newLevel = Math.floor(user.learningStats.totalXP / 1000) + 1;
      if (newLevel > (user.learningStats.level || 1)) {
        user.learningStats.level = newLevel;
        user.learningStats.xpToNextLevel = newLevel * 1000 - user.learningStats.totalXP;
        logger.success('User leveled up!', { 
          userId, 
          newLevel, 
          totalXP: user.learningStats.totalXP 
        }, 'STREAK');
      }

      await user.save();

      logger.info('Streak updated', {
        userId,
        activityType,
        previousStreak: currentStreak,
        newStreak,
        xpEarned,
        milestoneAchieved,
        message: streakMessage
      }, 'STREAK');

      return {
        success: true,
        streak: newStreak,
        previousStreak: currentStreak,
        message: streakMessage,
        milestoneAchieved,
        level: user.learningStats.level,
        totalXP: user.learningStats.totalXP,
        longestStreak: user.learningStats.longestStreak
      };
    } else {
      // Already practiced today - just update XP
      user.learningStats.totalXP = (user.learningStats.totalXP || 0) + xpEarned;
      await user.save();
      
      return {
        success: true,
        streak: currentStreak,
        message: '💪 Great job maintaining your streak!',
        alreadyPracticedToday: true
      };
    }
  } catch (error) {
    logger.errorWithStack('Error updating streak', error, 'STREAK');
    throw error;
  }
};

/**
 * Get user streak information
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Streak information
 */
export const getUserStreakInfo = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const learningStats = user.learningStats || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastPracticeDate = learningStats.lastPracticeDate;
    const hasPracticedToday = lastPracticeDate && 
      new Date(lastPracticeDate).setHours(0, 0, 0, 0) === today.getTime();

    // Check if streak is at risk
    let streakAtRisk = false;
    let daysSinceLastPractice = 0;
    
    if (lastPracticeDate) {
      const lastPractice = new Date(lastPracticeDate);
      daysSinceLastPractice = Math.floor((today - lastPractice) / (1000 * 60 * 60 * 24));
      streakAtRisk = daysSinceLastPractice >= 2;
    } else {
      streakAtRisk = true;
    }

    return {
      success: true,
      streak: learningStats.streak || 0,
      longestStreak: learningStats.longestStreak || 0,
      totalXP: learningStats.totalXP || 0,
      level: learningStats.level || 1,
      xpToNextLevel: learningStats.xpToNextLevel || 100,
      lastPracticeDate,
      hasPracticedToday,
      streakAtRisk,
      daysSinceLastPractice
    };
  } catch (error) {
    logger.errorWithStack('Error getting streak info', error, 'STREAK');
    throw error;
  }
};

/**
 * Reset user streak (for testing or admin purposes)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Reset result
 */
export const resetUserStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.learningStats) {
      user.learningStats = {};
    }

    user.learningStats.streak = 0;
    user.learningStats.lastPracticeDate = null;
    await user.save();

    logger.info('Streak reset', { userId }, 'STREAK');

    return {
      success: true,
      message: 'Streak reset successfully'
    };
  } catch (error) {
    logger.errorWithStack('Error resetting streak', error, 'STREAK');
    throw error;
  }
};