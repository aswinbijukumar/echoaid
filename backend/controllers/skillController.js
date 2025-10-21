import Skill from '../models/Skill.js';
import UserSkillProgress from '../models/UserSkillProgress.js';
import User from '../models/User.js';
import Sign from '../models/Sign.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';

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
    console.log('Completed skill IDs:', completedSkillIds);
    
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
    console.error('Get skills error:', error);
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
    console.error('Get user progress error:', error);
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
    const user = await User.findById(userId);
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
    console.error('Complete skill lesson error:', error);
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
      console.log(`No quiz found for Level ${level}`);
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
    console.error('Error checking level quiz:', error);
    return false;
  }
};

const checkSkillUnlockLogic = async (skill, allSkills, completedSkillIds, userProgress, userId) => {
  console.log('Checking unlock for skill:', skill.title, 'Level:', skill.level, 'Order:', skill.order);
  
  // First skill in the entire system (Level 0, Order 1) is always unlocked
  if (skill.order === 1 && skill.level === 0) {
    console.log('First skill unlocked:', skill.title);
    return true;
  }
  
  if (!userProgress) {
    console.log('No user progress, skill locked:', skill.title);
    return false;
  }
  
  // Get all skills in the same level, sorted by order
  const sameLevelSkills = allSkills.filter(s => s.level === skill.level).sort((a, b) => a.order - b.order);
  const currentSkillIndex = sameLevelSkills.findIndex(s => s._id.toString() === skill._id.toString());
  
  console.log('Same level skills:', sameLevelSkills.map(s => ({ title: s.title, order: s.order })));
  console.log('Current skill index:', currentSkillIndex);
  
  // If this is the first skill in its level, check if previous level is completed
  if (currentSkillIndex === 0) {
    // For Level 0, first skill is already unlocked (handled above)
    if (skill.level === 0) {
      console.log('Level 0 first skill should be unlocked:', skill.title);
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
    console.log('All previous level completed:', allPreviousLevelCompleted);
    console.log('Previous level quiz passed:', previousLevelQuizPassed);
    
    return allPreviousLevelCompleted && previousLevelQuizPassed;
  }
  
  // For other skills in the same level, check if previous skill in order is completed
  if (currentSkillIndex > 0) {
    const previousSkill = sameLevelSkills[currentSkillIndex - 1];
    const isPreviousCompleted = completedSkillIds.includes(previousSkill._id.toString());
    console.log('Previous skill in same level:', previousSkill.title, 'Completed:', isPreviousCompleted);
    return isPreviousCompleted;
  }
  
  console.log('Skill locked:', skill.title);
  return false;
};