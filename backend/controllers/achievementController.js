import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import User from '../models/User.js';
import logger from '../utils/prettyLogger.js';

// @desc    Get all achievements for a user
// @route   GET /api/achievements
// @access  Private
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all achievements with user's progress
    const achievements = await Achievement.find({ isActive: true })
      .sort({ category: 1, rarity: 1, name: 1 });
    
    // Get user's achievement progress
    const userAchievements = await UserAchievement.find({ userId })
      .populate('achievementId');
    
    // Create a map of user achievements for quick lookup
    const userAchievementMap = new Map();
    userAchievements.forEach(ua => {
      userAchievementMap.set(ua.achievementId._id.toString(), ua);
    });
    
    // Combine achievements with user progress
    const achievementsWithProgress = achievements.map(achievement => {
      const userAchievement = userAchievementMap.get(achievement._id.toString());
      
      return {
        id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward,
        badge: achievement.badge,
        isSecret: achievement.isSecret,
        requirements: achievement.requirements,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt,
        progress: userAchievement?.progress || 0,
        isCompleted: userAchievement?.isCompleted || false,
        xpEarned: userAchievement?.xpEarned || 0,
        // Hide secret achievements that aren't unlocked
        visible: !achievement.isSecret || !!userAchievement
      };
    });
    
    // Calculate achievement stats
    const totalAchievements = achievementsWithProgress.length;
    const unlockedAchievements = achievementsWithProgress.filter(a => a.unlocked).length;
    const completedAchievements = achievementsWithProgress.filter(a => a.isCompleted).length;
    const totalXPEarned = achievementsWithProgress
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.xpEarned, 0);
    
    const stats = {
      total: totalAchievements,
      unlocked: unlockedAchievements,
      completed: completedAchievements,
      locked: totalAchievements - unlockedAchievements,
      completionRate: totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0,
      totalXPEarned
    };
    
    logger.info('User achievements fetched', {
      userId,
      totalAchievements,
      unlockedAchievements,
      completionRate: stats.completionRate
    }, 'ACHIEVEMENT');
    
    res.status(200).json({
      success: true,
      data: {
        achievements: achievementsWithProgress,
        stats
      }
    });
    
  } catch (error) {
    logger.errorWithStack('Error fetching user achievements', error, 'ACHIEVEMENT');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
};

// @desc    Get achievement details
// @route   GET /api/achievements/:id
// @access  Private
export const getAchievementDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const achievement = await Achievement.findById(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }
    
    // Get user's progress for this achievement
    const userAchievement = await UserAchievement.findOne({
      userId,
      achievementId: id
    });
    
    const achievementData = {
      id: achievement._id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      rarity: achievement.rarity,
      xpReward: achievement.xpReward,
      badge: achievement.badge,
      requirements: achievement.requirements,
      unlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlockedAt,
      progress: userAchievement?.progress || 0,
      isCompleted: userAchievement?.isCompleted || false,
      xpEarned: userAchievement?.xpEarned || 0
    };
    
    res.status(200).json({
      success: true,
      data: achievementData
    });
    
  } catch (error) {
    logger.errorWithStack('Error fetching achievement details', error, 'ACHIEVEMENT');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement details'
    });
  }
};

// @desc    Check and award achievements (internal function)
// @route   POST /api/achievements/check
// @access  Private
export const checkAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, activityData } = req.body;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get all active achievements
    const achievements = await Achievement.find({ isActive: true });
    const newAchievements = [];
    
    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existingAchievement = await UserAchievement.findOne({
        userId,
        achievementId: achievement._id
      });
      
      if (existingAchievement) continue;
      
      let shouldAward = false;
      let progress = 0;
      
      // Check achievement requirements based on type
      switch (achievement.requirements.type) {
        case 'streak':
          if (user.learningStats?.streak >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (user.learningStats?.streak || 0) / achievement.requirements.value * 100);
          }
          break;
          
        case 'xp':
          if (user.learningStats?.totalXP >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (user.learningStats?.totalXP || 0) / achievement.requirements.value * 100);
          }
          break;
          
        case 'level':
          if (user.learningStats?.level >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (user.learningStats?.level || 1) / achievement.requirements.value * 100);
          }
          break;
          
        case 'score':
          if (activityData?.score >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (activityData?.score || 0) / achievement.requirements.value * 100);
          }
          break;
          
        case 'completion':
          // Count completed activities based on category
          let completedCount = 0;
          if (achievement.requirements.category === 'quiz') {
            completedCount = user.learningStats?.completedQuizzes || 0;
          } else if (achievement.requirements.category === 'practice') {
            completedCount = user.learningStats?.completedPractices || 0;
          }
          
          if (completedCount >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, completedCount / achievement.requirements.value * 100);
          }
          break;
      }
      
      if (shouldAward) {
        // Create user achievement
        const userAchievement = new UserAchievement({
          userId,
          achievementId: achievement._id,
          progress: 100,
          isCompleted: true,
          xpEarned: achievement.xpReward
        });
        
        await userAchievement.save();
        
        // Update user stats
        user.learningStats.totalXP += achievement.xpReward;
        if (achievement.badge) {
          if (!user.learningStats.badges) user.learningStats.badges = [];
          user.learningStats.badges.push(achievement.badge);
        }
        if (!user.learningStats.achievements) user.learningStats.achievements = [];
        user.learningStats.achievements.push(userAchievement._id);
        
        await user.save();
        
        newAchievements.push({
          id: achievement._id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          badge: achievement.badge
        });
        
        logger.gamification(`Achievement unlocked: ${achievement.name} (+${achievement.xpReward} XP)`, {
          userId,
          achievementId: achievement._id,
          xpReward: achievement.xpReward
        }, 'ACHIEVEMENT');
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        newAchievements,
        totalChecked: achievements.length
      }
    });
    
  } catch (error) {
    logger.errorWithStack('Error checking achievements', error, 'ACHIEVEMENT');
    res.status(500).json({
      success: false,
      message: 'Failed to check achievements'
    });
  }
};

// @desc    Get achievement categories
// @route   GET /api/achievements/categories
// @access  Private
export const getAchievementCategories = async (req, res) => {
  try {
    const categories = await Achievement.distinct('category');
    const rarities = await Achievement.distinct('rarity');
    
    res.status(200).json({
      success: true,
      data: {
        categories,
        rarities
      }
    });
    
  } catch (error) {
    logger.errorWithStack('Error fetching achievement categories', error, 'ACHIEVEMENT');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement categories'
    });
  }
};