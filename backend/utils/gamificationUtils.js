/**
 * Unified Gamification Utility for EchoAid
 * Standardizes Level and XP calculation across all modules.
 */

// XP per level constant
export const XP_PER_LEVEL = 1000;

/**
 * Calculates current level based on total XP
 * @param {number} totalXP 
 * @returns {number} Level (1-indexed)
 */
export const calculateLevel = (totalXP) => {
  if (!totalXP || isNaN(totalXP)) return 1;
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
};

/**
 * Calculates XP remaining to reach the next level
 * @param {number} totalXP 
 * @returns {number} Remaining XP
 */
export const calculateXPToNextLevel = (totalXP) => {
  if (totalXP === undefined || totalXP === null || isNaN(totalXP)) return XP_PER_LEVEL;
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = currentLevel * XP_PER_LEVEL;
  return Math.max(0, nextLevelXP - totalXP);
};

/**
 * Updates a user document with consistent learning stats
 * @param {object} user - Mongoose User document
 * @param {number} additionalXP - XP earned in this action
 * @param {string} activityType - 'lesson', 'quiz', 'practice'
 */
export const syncUserStats = async (user, additionalXP, activityType) => {
  if (!user.learningStats) {
    user.learningStats = { totalXP: 0, level: 1, xpToNextLevel: XP_PER_LEVEL };
  }

  // Add XP
  user.learningStats.totalXP += additionalXP;

  // Calculate new level and progress
  const oldLevel = user.learningStats.level || 1;
  const newLevel = calculateLevel(user.learningStats.totalXP);
  
  user.learningStats.level = newLevel;
  user.learningStats.xpToNextLevel = calculateXPToNextLevel(user.learningStats.totalXP);

  // Return level-up status for UI notifications
  return {
    leveledUp: newLevel > oldLevel,
    newLevel,
    xpEarned: additionalXP
  };
};
