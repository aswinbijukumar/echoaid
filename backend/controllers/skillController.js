import Skill from '../models/Skill.js';
import logger from '../utils/prettyLogger.js';
import UserSkillProgress from '../models/UserSkillProgress.js';
import User from '../models/User.js';
import Sign from '../models/Sign.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { checkSubscriptionAccess, checkDailyLimits } from '../middleware/subscriptionAuth.js';
import { updateUserStreak } from './streakController.js';

// Get all skills with user progress
export const getSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const skills = await Skill.find({ isActive: true })
      .populate('signs', 'word category difficulty imagePath videoPath')
      .populate('targetSign', 'word category difficulty imagePath videoPath')
      .sort({ level: 1, order: 1 }); // Sort by level first, then by order

    // Get user progress
    const userProgress = await UserSkillProgress.findOne({ user: userId });
    
    // Get completed skill IDs for unlocking logic
    const completedSkillIds = userProgress?.skills
      ?.filter(sp => sp.isCompleted)
      ?.map(sp => sp.skill.toString()) || [];
    
    // Debug: Log skills data (remove in production)
    console.log('Skills data:', skills.map(s => ({ 
      title: s.title, 
      level: s.level, 
      order: s.order,
      skillLevel: s.level 
    })));
    logger.debug('Completed skill IDs:', completedSkillIds, 'CONTROLLER');
    
    const skillsWithProgress = await Promise.all(skills.map(async (skill, index) => {
      const skillProgress = userProgress?.skills.find(
        sp => sp.skill.toString() === skill._id.toString()
      );
      
      // Enhanced unlock logic: handle levels and order properly
      const isUnlocked = await checkSkillUnlockLogic(skill, skills, completedSkillIds, userProgress, userId);
      const isCompleted = skillProgress?.isCompleted || false;
      const level = skillProgress?.level || 0;
      
      return {
        ...skill.toObject(),
        isCompleted,
        isUnlocked,
        userLevel: level, // User's progress level
        skillLevel: skill.level, // Original skill level
        level: skill.level, // Use admin-set level, not user progress level
        progress: (level / 5) * 100,
        completedAt: skillProgress?.completedAt,
        lastPracticed: skillProgress?.lastPracticed,
        totalXP: skillProgress?.totalXP || 0,
        attempts: skillProgress?.attempts || 0,
        correctAnswers: skillProgress?.correctAnswers || 0,
        streak: skillProgress?.streak || 0
      };
    }));

    res.status(200).json({
      success: true,
      data: skillsWithProgress
    });
  } catch (error) {
    logger.errorWithStack('Get skills error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user progress
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let userProgress = await UserSkillProgress.findOne({ user: userId });
    if (!userProgress) {
      userProgress = new UserSkillProgress({ user: userId });
      await userProgress.save();
    }

    res.status(200).json({
      success: true,
      data: {
        dailyProgress: userProgress.daily.progress,
        hearts: userProgress.hearts,
        gems: userProgress.gems,
        streak: userProgress.streak,
        lastActiveDate: userProgress.lastActiveDate
      }
    });
  } catch (error) {
    logger.errorWithStack('Get user progress error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete skill lesson
export const completeSkillLesson = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { score, mistakes, perfect, heartsUsed } = req.body;
    const userId = req.user.id;

    // Check subscription-based learning limits (skip for admin users)
    const user = await User.findById(userId).select('subscription role');
    if (user?.role !== 'admin' && user?.subscription?.status === 'trial') {
      // Check daily learning module completions for trial users
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayCompletions = await UserSkillProgress.aggregate([
        { $match: { user: userId } },
        { $unwind: '$skills' },
        { 
          $match: { 
            'skills.isCompleted': true,
            'skills.completedAt': { $gte: today, $lt: tomorrow }
          }
        },
        { $count: 'completed' }
      ]);
      
      const completedToday = todayCompletions[0]?.completed || 0;
      const maxDailyModules = 3; // Free trial users can complete 3 modules per day
      
      if (completedToday >= maxDailyModules) {
        return res.status(403).json({
          success: false,
          message: `Free trial limit reached. You can complete ${maxDailyModules} learning modules per day. Upgrade to Pro for unlimited learning.`,
          data: { 
            maxDailyModules, 
            currentCompletions: completedToday,
            upgradeRequired: true 
          }
        });
      }
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Calculate XP earned
    const xpEarned = Math.round(score * 0.1);
    
    // Update user progress
    let userProgress = await UserSkillProgress.findOne({ user: userId });
    if (!userProgress) {
      userProgress = new UserSkillProgress({ user: userId });
    }

    // Update hearts
    userProgress.hearts = Math.max(0, userProgress.hearts - heartsUsed);
    
    // Update daily progress
    userProgress.daily.progress += xpEarned;
    userProgress.daily.lastActiveDate = new Date();
    userProgress.lastActiveDate = new Date();

    // Update skill progress
    const existingSkillIndex = userProgress.skills.findIndex(
      sp => sp.skill.toString() === skillId
    );

    if (existingSkillIndex >= 0) {
      const skillProgress = userProgress.skills[existingSkillIndex];
      skillProgress.attempts += 1;
      skillProgress.correctAnswers += (perfect ? 1 : 0);
      skillProgress.totalXP += xpEarned;
      skillProgress.lastPracticed = new Date();
      
      // Mark as completed immediately when user finishes the module
      if (!skillProgress.isCompleted) {
        skillProgress.isCompleted = true;
        skillProgress.completedAt = new Date();
        skillProgress.level = 1; // Set to level 1 when completed
      }
      
      // Update streak
      if (perfect) {
        skillProgress.streak += 1;
      } else {
        skillProgress.streak = 0;
      }
    } else {
      userProgress.skills.push({
        skill: skillId,
        level: 1,
        isCompleted: true, // Mark as completed immediately
        isUnlocked: true,
        completedAt: new Date(), // Set completion date
        lastPracticed: new Date(),
        totalXP: xpEarned,
        attempts: 1,
        correctAnswers: perfect ? 1 : 0,
        streak: perfect ? 1 : 0
      });
    }

    // Update overall streak
    if (userProgress.daily.progress >= userProgress.daily.goal) {
      userProgress.streak += 1;
    }

    await userProgress.save();

    // Check for overall user level up
    const currentUserLevel = user.learningStats?.level || 0;
    const newUserLevel = Math.floor(userProgress.daily.progress / 1000); // Level up every 1000 XP
    const userLevelUp = newUserLevel > currentUserLevel;

    // Update User model learning stats
    await User.findByIdAndUpdate(userId, {
      $set: {
        'learningStats.totalXP': userProgress.daily.progress,
        'learningStats.streak': userProgress.streak,
        'learningStats.lastActiveDate': userProgress.lastActiveDate,
        'learningStats.level': newUserLevel
      }
    });

    // Update streak based on skill completion
    try {
      const streakResult = await updateUserStreak(userId, 'skill', xpEarned);
      logger.info('Streak updated after skill completion', {
        userId,
        streak: streakResult.streak,
        message: streakResult.message,
        milestoneAchieved: streakResult.milestoneAchieved
      }, 'STREAK');
    } catch (streakError) {
      logger.errorWithStack('Failed to update streak after skill completion', streakError, 'STREAK');
      // Don't fail the skill completion if streak update fails
    }

    // Check if this is the last module in the current level
    const currentLevel = skill.level;
    const allSkillsInLevel = await Skill.find({ 
      level: currentLevel, 
      isActive: true 
    }).sort({ order: 1 });
    
    const completedSkillsInLevel = allSkillsInLevel.filter(s => 
      userProgress.skills.some(sp => 
        sp.skill.toString() === s._id.toString() && sp.isCompleted
      )
    );
    
    const isLastModuleInLevel = completedSkillsInLevel.length === allSkillsInLevel.length;

    res.status(200).json({
      success: true,
      data: {
        lessonCompleted: true,
        xpEarned,
        mistakes,
        perfect,
        score,
        heartsUsed,
        newLevel: userProgress.skills[existingSkillIndex]?.level || 1,
        totalXP: userProgress.daily.progress,
        streak: userProgress.streak,
        isLastModuleInLevel,
        currentLevel,
        completedInLevel: completedSkillsInLevel.length,
        totalInLevel: allSkillsInLevel.length,
        user: {
          levelUp: userLevelUp,
          newLevel: newUserLevel,
          learningStats: {
            totalXP: userProgress.daily.progress,
            streak: userProgress.streak,
            level: newUserLevel
          }
        }
      }
    });
  } catch (error) {
    logger.errorWithStack('Complete skill lesson error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper functions
// Check if user has passed the quiz for a specific level
const checkLevelQuizPassed = async (userId, level) => {
  try {
    // Find the quiz for this level
    const quiz = await Quiz.findOne({
      title: `Level ${level} Mastery Quiz`,
      isActive: true
    });

    if (!quiz) {
      logger.info('No quiz found for Level ${level}', null, 'CONTROLLER');
      return false;
    }

    // Check if user has passed this quiz
    const passedAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: quiz._id,
      score: { $gte: quiz.passingScore }
    });

    console.log(`Level ${level} quiz passed:`, !!passedAttempt);
    return !!passedAttempt;
  } catch (error) {
    logger.errorWithStack('Error checking level quiz:', error, error, 'CONTROLLER');
    return false;
  }
};

const checkSkillUnlockLogic = async (skill, allSkills, completedSkillIds, userProgress, userId) => {
  logger.debug('Checking unlock for skill:', skill.title, 'Level:', skill.level, 'Order:', skill.order, 'CONTROLLER');
  
  // First skill in the entire system (Level 0, Order 1) is always unlocked
  if (skill.order === 1 && skill.level === 0) {
    logger.debug('First skill unlocked:', skill.title, 'CONTROLLER');
    return true;
  }
  
  if (!userProgress) {
    logger.debug('No user progress, skill locked:', skill.title, 'CONTROLLER');
    return false;
  }
  
  // Get all skills in the same level, sorted by order
  const sameLevelSkills = allSkills.filter(s => s.level === skill.level).sort((a, b) => a.order - b.order);
  const currentSkillIndex = sameLevelSkills.findIndex(s => s._id.toString() === skill._id.toString());
  
  console.log('Same level skills:', sameLevelSkills.map(s => ({ title: s.title, order: s.order })));
  logger.debug('Current skill index:', currentSkillIndex, 'CONTROLLER');
  
  // If this is the first skill in its level, check if previous level is completed
  if (currentSkillIndex === 0) {
    // For Level 0, first skill is already unlocked (handled above)
    if (skill.level === 0) {
      logger.debug('Level 0 first skill should be unlocked:', skill.title, 'CONTROLLER');
      return true;
    }
    
    // For other levels, check if all skills in previous level are completed
    const previousLevelSkills = allSkills.filter(s => s.level === skill.level - 1);
    const allPreviousLevelCompleted = previousLevelSkills.every(s => 
      completedSkillIds.includes(s._id.toString())
    );
    
    // Also check if user has passed the quiz for the previous level
    const previousLevelQuizPassed = await checkLevelQuizPassed(userId, skill.level - 1);
    
    console.log('Previous level skills:', previousLevelSkills.map(s => ({ title: s.title, completed: completedSkillIds.includes(s._id.toString()) })));
    logger.debug('All previous level completed:', allPreviousLevelCompleted, 'CONTROLLER');
    logger.debug('Previous level quiz passed:', previousLevelQuizPassed, 'CONTROLLER');
    
    return allPreviousLevelCompleted && previousLevelQuizPassed;
  }
  
  // For other skills in the same level, check if previous skill in order is completed
  if (currentSkillIndex > 0) {
    const previousSkill = sameLevelSkills[currentSkillIndex - 1];
    const isPreviousCompleted = completedSkillIds.includes(previousSkill._id.toString());
    logger.debug('Previous skill in same level:', previousSkill.title, 'Completed:', isPreviousCompleted, 'CONTROLLER');
    return isPreviousCompleted;
  }
  
  logger.debug('Skill locked:', skill.title, 'CONTROLLER');
  return false;
};