import Skill from '../models/Skill.js';
import UserSkillProgress from '../models/UserSkillProgress.js';
import User from '../models/User.js';
import Sign from '../models/Sign.js';

// Get all skills with user progress
export const getSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const skills = await Skill.find({ isActive: true })
      .populate('signs', 'word category difficulty imagePath videoPath')
      .populate('targetSign', 'word category difficulty imagePath videoPath')
      .sort({ category: 1, order: 1 });

    // Get user progress
    const userProgress = await UserSkillProgress.findOne({ user: userId });
    
    const skillsWithProgress = skills.map(skill => {
      const skillProgress = userProgress?.skills.find(
        sp => sp.skill.toString() === skill._id.toString()
      );
      
      const isUnlocked = checkSkillUnlock(skill, userProgress);
      const isCompleted = skillProgress?.isCompleted || false;
      const level = skillProgress?.level || 0;
      
      return {
        ...skill.toObject(),
        isCompleted,
        isUnlocked,
        level,
        progress: (level / 5) * 100,
        completedAt: skillProgress?.completedAt,
        lastPracticed: skillProgress?.lastPracticed,
        totalXP: skillProgress?.totalXP || 0,
        attempts: skillProgress?.attempts || 0,
        correctAnswers: skillProgress?.correctAnswers || 0,
        streak: skillProgress?.streak || 0
      };
    });

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
      
      // Level up if enough XP
      if (skillProgress.totalXP >= skill.xpReward * (skillProgress.level + 1)) {
        skillProgress.level = Math.min(5, skillProgress.level + 1);
        skillProgress.isCompleted = skillProgress.level >= 5;
        skillProgress.completedAt = skillProgress.isCompleted ? new Date() : null;
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
        isCompleted: false,
        isUnlocked: true,
        completedAt: null,
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

    // Update User model learning stats
    await User.findByIdAndUpdate(userId, {
      $set: {
        'learningStats.totalXP': userProgress.daily.progress,
        'learningStats.streak': userProgress.streak,
        'learningStats.lastActiveDate': userProgress.lastActiveDate
      }
    });

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
        streak: userProgress.streak
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
const checkSkillUnlock = (skill, userProgress) => {
  if (!userProgress) return skill.order === 1;
  
  // Check prerequisites
  const completedSkillIds = userProgress.skills
    .filter(sp => sp.isCompleted)
    .map(sp => sp.skill.toString());
  
  const hasPrerequisites = skill.prerequisites.every(prereq => 
    completedSkillIds.includes(prereq.toString())
  );
  
  // Check level and XP requirements
  const meetsLevel = userProgress.skills.some(sp => sp.level >= skill.unlockRequirements.minLevel);
  const meetsXP = userProgress.daily.progress >= skill.unlockRequirements.minXP;
  
  return hasPrerequisites && (meetsLevel || meetsXP);
};