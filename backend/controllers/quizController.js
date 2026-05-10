import Quiz from '../models/Quiz.js';
import logger from '../utils/prettyLogger.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import QuestionBank from '../models/QuestionBank.js';
import Skill from '../models/Skill.js';
import UserSkillProgress from '../models/UserSkillProgress.js';
import Certificate from '../models/Certificate.js';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';
import { checkSubscriptionAccess, checkDailyLimits } from '../middleware/subscriptionAuth.js';
import { calculateLevel, calculateXPToNextLevel } from '../utils/gamificationUtils.js';
import { updateUserStreak } from './streakController.js';


// Get all Quizzes with filtering and pagination
export const getQuizzes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // If user is authenticated, attach their progress
    if (req.user) {
      const quizIds = quizzes.map(q => q._id);
      const attempts = await QuizAttempt.find({
        userId: req.user._id,
        quizId: { $in: quizIds }
      });

      quizzes = await Promise.all(quizzes.map(async quiz => {
        const quizAttempts = attempts.filter(a => a.quizId.toString() === quiz._id.toString());
        const passed = quizAttempts.some(a => a.passed);
        const bestScore = quizAttempts.reduce((max, a) => Math.max(max, a.percentage), 0);

        // Check Lock Status for Mastery Quizzes
        let isLocked = false;
        let lockReason = null;
        if (quiz.title.includes('Level') && quiz.title.includes('Mastery Quiz')) {
          const levelMatch = quiz.title.match(/Level (\d+)/);
          if (levelMatch) {
            const targetLevel = parseInt(levelMatch[1]);
            const unlocked = await checkLevelMasteryQuizUnlock(req.user._id, targetLevel);
            if (!unlocked) {
              isLocked = true;
              lockReason = `Complete Level ${targetLevel} modules to unlock`;
            }
          }
        }

        return {
          ...quiz,
          isLocked,
          lockReason,
          userStatus: {
            completed: passed,
            passed: passed,
            bestScore: bestScore,
            attempts: quizAttempts.length
          }
        };
      }));
    }

    const total = await Quiz.countDocuments(filter);

    res.json({
      success: true,
      data: quizzes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single quiz with questions
export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'name')
      .populate('questions.signReference', 'word imageUrl')
      .lean();

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.isActive) {
      return res.status(403).json({ success: false, message: 'Quiz is not available' });
    }

    // Attach user status if authenticated
    if (req.user) {
      const attempts = await QuizAttempt.find({
        userId: req.user._id,
        quizId: quiz._id
      });

      const passed = attempts.some(a => a.passed);
      const bestScore = attempts.reduce((max, a) => Math.max(max, a.percentage), 0);

      quiz.userStatus = {
        completed: passed,
        passed: passed,
        bestScore: bestScore,
        attempts: attempts.length
      };
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start quiz attempt
export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isActive) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check subscription-based quiz limits (skip for admin users)
    const user = await User.findById(userId).select('subscription role');
    if (user?.role !== 'admin' && user?.subscription?.status === 'trial') {
      // Check daily quiz attempts for trial users
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAttempts = await QuizAttempt.countDocuments({
        userId,
        createdAt: { $gte: today, $lt: tomorrow }
      });

      const maxDailyAttempts = 5; // Free trial users get 5 quiz attempts per day
      if (todayAttempts >= maxDailyAttempts) {
        return res.status(403).json({
          success: false,
          message: `Free trial limit reached. You can attempt ${maxDailyAttempts} Quizes per day. Upgrade to Pro for unlimited Quizes.`,
          data: {
            maxDailyAttempts,
            currentAttempts: todayAttempts,
            upgradeRequired: true
          }
        });
      }
    }

    // Check if this is a level mastery quiz and if user has completed required modules
    if (quiz.title.includes('Level') && quiz.title.includes('Mastery Quiz')) {
      const levelMatch = quiz.title.match(/Level (\d+)/);
      if (levelMatch) {
        const targetLevel = parseInt(levelMatch[1]);
        const isUnlocked = await checkLevelMasteryQuizUnlock(userId, targetLevel);

        if (!isUnlocked) {
          return res.status(403).json({
            success: false,
            message: `Complete all Level ${targetLevel} modules to unlock this quiz.`,
            data: {
              requiredLevel: targetLevel,
              quizTitle: quiz.title,
              unlockType: 'module_completion'
            }
          });
        }
      }
    }

    // Simple gating: require prior passes in category for higher difficulties
    if (quiz.difficulty === 'Intermediate' || quiz.difficulty === 'Advanced') {
      const requiredPasses = quiz.difficulty === 'Advanced' ? 3 : 2;
      const passes = await QuizAttempt.countDocuments({ userId, category: quiz.category, passed: true });
      if (passes < requiredPasses) {
        return res.status(403).json({
          success: false,
          message: `Unlock requirement: Pass ${requiredPasses} ${quiz.category} quiz${requiredPasses > 1 ? 'zes' : ''} to access ${quiz.difficulty}.`,
          data: { requiredPasses, currentPasses: passes, category: quiz.category, difficulty: quiz.difficulty }
        });
      }
    }

    // Determine effective max attempts based on subscription plan
    const plan = user?.role === 'admin' ? 'admin' : (user?.subscription?.plan || 'free');
    const effectiveMaxAttempts = (() => {
      if (plan === 'admin' || plan === 'enterprise') return Infinity; // Unlimited
      if (plan === 'premium') return 8;
      if (plan === 'pro') return 5;
      return quiz.maxAttempts || 3; // Free / trial
    })();

    // Check if user has remaining attempts
    const attempts = await QuizAttempt.find({ userId, quizId });
    const hasPassed = attempts.some(a => a.passed);

    if (!hasPassed && attempts.length >= effectiveMaxAttempts) {
      // For Mastery Quizes, check if they've finished relearning even if attempts weren't cleared
      const isMastery = quiz.quizType === 'mastery' || quiz.title.includes('Mastery');
      if (isMastery) {
        const levelMatch = quiz.title.match(/Level (\d+)/);
        const targetLevel = levelMatch ? parseInt(levelMatch[1]) : quiz.level;
        const isUnlocked = await checkLevelMasteryQuizUnlock(userId, targetLevel);

        if (!isUnlocked) {
          return res.status(400).json({
            success: false,
            message: 'Maximum attempts reached. Please review the learning modules for this level before retrying.'
          });
        }
        // If isUnlocked is true, we allow them to proceed (bypass the attempts block)
        logger.info(`🔓 Bypassing attempts limit for Mastery Quiz ${quiz._id} as requirements are met.`, null, 'CONTROLLER');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Maximum attempts reached for this quiz. Please review your learning materials.'
        });
      }
    }

    // Get adaptive questions based on user performance
    const adaptiveQuestions = await getAdaptiveQuestions(quiz, user);

    // Compute today's XP for daily ring
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayAttempts = await QuizAttempt.find({ userId, completedAt: { $gte: startOfDay } }, { xpEarned: 1 }).lean();
    const xpToday = todayAttempts.reduce((s, a) => s + (a.xpEarned || 0), 0);

    res.json({
      success: true,
      data: {
        quizId: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: adaptiveQuestions,
        totalQuestions: adaptiveQuestions.length,
        attemptNumber: attempts.length + 1,
        maxAttempts: quiz.maxAttempts,
        learning: {
          streak: user.learningStats?.streak || 0,
          dailyGoal: user.learningStats?.dailyGoal || 100,
          xpToday
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz attempt
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Calculate score and results
    const results = calculateQuizResults(quiz, answers, timeSpent);

    // Fetch user before stats update to detect level-up
    const prevUser = await User.findById(userId).lean();
    const prevLevel = prevUser?.learningStats?.level || 1;

    // Prevent duplicate XP on re-clears: if user already has a passed attempt at 100% for this quiz, zero out XP
    let xpEarnedFinal = results.xpEarned;
    const priorPerfect = await QuizAttempt.findOne({ userId, quizId, percentage: 100, passed: true }).lean();
    if (priorPerfect) {
      xpEarnedFinal = 0;
    }

    // Create quiz attempt record
    const quizAttempt = new QuizAttempt({
      userId,
      quizId,
      answers: results.answers,
      score: results.score,
      percentage: results.percentage,
      timeSpent,
      completedAt: new Date(),
      passed: results.percentage >= quiz.passingScore,
      streak: await calculateStreak(userId),
      xpEarned: xpEarnedFinal,
      difficulty: quiz.difficulty,
      category: quiz.category
    });

    await quizAttempt.save();

    logger.info(`📝 Quiz submission: User ${userId} got ${results.percentage}% on "${quiz.title}". Passed: ${quizAttempt.passed}`, null, 'CONTROLLER');

    // Update user stats and check achievements
    await updateUserStats(userId, quizAttempt);
    const newAchievements = await checkAchievements(userId, quizAttempt);

    // Update streak based on quiz completion
    try {
      const streakResult = await updateUserStreak(userId, 'quiz', xpEarnedFinal);
      logger.info('Streak updated after quiz completion', {
        userId,
        streak: streakResult.streak,
        message: streakResult.message,
        milestoneAchieved: streakResult.milestoneAchieved
      }, 'STREAK');
    } catch (streakError) {
      logger.errorWithStack('Failed to update streak after quiz', streakError, 'STREAK');
      // Don't fail the quiz submission if streak update fails
    }

    // Update quiz stats
    await updateQuizStats(quizId, results.percentage);

    // Check if this is a level mastery quiz and unlock next level
    let nextLevelUnlocked = false;
    let earnedCertificate = null;

    // Robust check: quizType === 'mastery', OR title matches pattern,
    // OR quiz has an explicit numeric level set (auto-generated mastery quizzes)
    const hasExplicitLevel = quiz.level !== undefined && quiz.level !== null;
    const isMastery = quiz.quizType === 'mastery'
      || /level\s*\d+.*(mastery|challenge|check)/i.test(quiz.title)
      || (hasExplicitLevel && (quiz.tags?.includes('auto-generated') || quiz.quizType === 'level'));

    if (isMastery && quizAttempt.passed) {
      // Prefer explicit level field, fallback to parsing title
      let completedLevel = quiz.level;
      if ((completedLevel === undefined || completedLevel === null) && quiz.title.match(/Level (\d+)/)) {
        completedLevel = parseInt(quiz.title.match(/Level (\d+)/)[1]);
      }

      if (completedLevel !== undefined && completedLevel !== null) {
        logger.info(`🎯 Level ${completedLevel} mastery passed, unlocking Level ${completedLevel + 1}`, null, 'CONTROLLER');
        nextLevelUnlocked = true;

        // Issue Certificate for Level Mastery
        try {
          // Check if already issued (check all known title variants)
          const titleVariants = [
            `Level ${completedLevel} Mastery`,
            completedLevel === 0 ? 'Level 0 Basics' : null,
            completedLevel === 2 ? 'Level 2 Intermediate' : null,
            completedLevel === 3 ? 'Level 3 Advanced' : null,
          ].filter(Boolean);

          const existingCert = await Certificate.findOne({
            user: userId,
            title: { $in: titleVariants },
            type: 'level_mastery'
          });

          if (!existingCert) {
            let certTitle = `Level ${completedLevel} Mastery`;
            if (completedLevel === 2) certTitle = 'Level 2 Intermediate';
            else if (completedLevel === 3) certTitle = 'Level 3 Advanced';

            earnedCertificate = new Certificate({
              user: userId,
              title: certTitle,
              type: 'level_mastery',
              referenceId: quizId,
              referenceModel: 'Quiz'
            });
            await earnedCertificate.save();
            logger.info(`📜 Certificate issued: ${earnedCertificate.certificateCode} - ${certTitle}`, null, 'CONTROLLER');
          } else {
            logger.info(`📜 Certificate already exists for Level ${completedLevel} (${existingCert.title})`, null, 'CONTROLLER');
          }
        } catch (certError) {
          logger.errorWithStack('Failed to issue certificate', certError, 'CONTROLLER');
        }
      }
    }

    // Fetch updated user stats to return to client for gamification UI
    const updatedUser = await User.findById(userId).lean();
    const learningStats = updatedUser?.learningStats || {};
    const levelUp = (learningStats.level || 1) > prevLevel;

    // Check if max attempts reached on failure
    if (results.percentage < quiz.passingScore) {
      const totalAttempts = await QuizAttempt.countDocuments({ userId, quizId });

      if (totalAttempts >= quiz.maxAttempts) {
        logger.info(`🚫 Max attempts reached for quiz ${quizId}. Triggering relearning protocol.`, null, 'CONTROLLER');
        await enforceRelearning(userId, quiz);

        // Modify response to inform frontend
        res.json({
          success: true,
          data: {
            attemptId: quizAttempt._id,
            score: results.score,
            percentage: results.percentage,
            passed: false,
            xpEarned: 0,
            streak: 0,
            feedback: "Maximum attempts reached. You must review the learning modules before retrying.",
            relearningTriggered: true,
            learningStats,
            levelUp: false,
            nextLevelUnlocked: false
          }
        });
        return;
      }
    }

    res.json({
      success: true,
      data: {
        attemptId: quizAttempt._id,
        score: results.score,
        percentage: results.percentage,
        passed: quizAttempt.passed,
        xpEarned: xpEarnedFinal,
        streak: quizAttempt.streak,
        feedback: results.feedback,
        perfect: results.perfect,
        fast: results.fast,
        newAchievements,
        timeSpent,
        learningStats,
        levelUp,
        nextLevelUnlocked,
        newCertificate: earnedCertificate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to reset progress if max attempts failed
const enforceRelearning = async (userId, quiz) => {
  try {
    let filter = {};
    const isMastery = quiz.quizType === 'mastery' || /mastery|challenge|check/i.test(quiz.title);

    // Determine level/category to reset
    if (isMastery) {
      let level = quiz.level;
      if (!level && quiz.title.match(/Level (\d+)/)) {
        level = parseInt(quiz.title.match(/Level (\d+)/)[1]);
      }
      if (level) filter = { level: level };
    }

    // If we found a valid level filter, reset those skills
    if (filter.level) {
      const skillsToReset = await Skill.find(filter).select('_id');
      const skillIds = skillsToReset.map(s => s._id.toString());

      if (skillIds.length > 0) {
        // Find existing progress
        const userProgress = await UserSkillProgress.findOne({ user: userId });
        if (userProgress) {
          let updatedCount = 0;
          userProgress.skills.forEach(skillProgress => {
            if (skillIds.includes(skillProgress.skill.toString())) {
              skillProgress.isCompleted = false;
              skillProgress.isRelearning = true;
              updatedCount++;
            }
          });

          if (updatedCount > 0) {
            await userProgress.save();
            logger.info(`🔄 Reset ${updatedCount} skills for user ${userId} to relearning status due to quiz failure.`, null, 'CONTROLLER');
          } else {
            logger.warn(`⚠️ No matching skills found in user progress for Level ${filter.level} despite quiz failure.`, null, 'CONTROLLER');
          }
        }
      }
    }
  } catch (error) {
    logger.errorWithStack('Failed to enforce relearning', error, 'CONTROLLER');
  }
};

// Get user's quiz attempts
export const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, category, difficulty } = req.query;

    const filter = { userId };
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;

    const attempts = await QuizAttempt.find(filter)
      .populate('quizId', 'title category difficulty')
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await QuizAttempt.countDocuments(filter);

    res.json({
      success: true,
      data: attempts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user progress and stats
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('achievements.achievementId')
      .lean();

    const recentAttempts = await QuizAttempt.find({ userId })
      .populate('quizId', 'title category')
      .sort({ completedAt: -1 })
      .limit(5)
      .lean();

    const categoryStats = await QuizAttempt.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$category',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          totalXP: { $sum: '$xpEarned' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user: {
          level: user.learningStats.level,
          totalXP: user.learningStats.totalXP,
          xpToNextLevel: user.learningStats.xpToNextLevel,
          streak: user.learningStats.streak,
          longestStreak: user.learningStats.longestStreak,
          QuizesCompleted: user.learningStats.QuizesCompleted,
          perfectQuizes: user.learningStats.perfectQuizes,
          averageQuizScore: user.learningStats.averageQuizScore,
          achievements: user.learningStats.achievements,
          badges: user.learningStats.badges,
          categoryProgress: user.learningStats.categoryProgress
        },
        recentAttempts,
        categoryStats,
        goals: {
          daily: user.learningStats.dailyGoal,
          weekly: user.learningStats.weeklyGoal,
          monthly: user.learningStats.monthlyGoal
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper Functions

const getAdaptiveQuestions = async (quiz, user) => {
  // If user is new or has no performance data, return random questions
  if (!user.learningStats.recentQuizes || user.learningStats.recentQuizes.length === 0) {
    return quiz.questions.sort(() => Math.random() - 0.5);
  }

  // Get user's weak areas
  const weakAreas = user.learningStats.weakAreas || [];
  const strongAreas = user.learningStats.strongAreas || [];

  // Filter questions based on user performance
  let adaptiveQuestions = quiz.questions.filter(q => {
    // Include more questions from weak areas
    if (weakAreas.includes(q.category)) {
      return Math.random() < 0.8; // 80% chance
    }
    // Include fewer questions from strong areas
    if (strongAreas.includes(q.category)) {
      return Math.random() < 0.3; // 30% chance
    }
    // Normal selection for other areas
    return Math.random() < 0.6; // 60% chance
  });

  // If not enough questions, add random ones
  if (adaptiveQuestions.length < quiz.questions.length) {
    const remaining = quiz.questions.filter(q => !adaptiveQuestions.includes(q));
    adaptiveQuestions = [...adaptiveQuestions, ...remaining.sort(() => Math.random() - 0.5)];
  }

  return adaptiveQuestions.slice(0, quiz.questions.length);
};

const calculateQuizResults = (quiz, answers, timeSpent) => {
  let score = 0;
  let totalPoints = 0;
  const processedAnswers = [];

  answers.forEach((answer, index) => {
    // Find question by ID if available, else fallback to index (risky if shuffled)
    let question;
    if (answer.questionId) {
      question = quiz.questions.find(q => q._id.toString() === answer.questionId.toString());
    }

    // Fallback if not found or no ID
    if (!question) {
      question = quiz.questions[index];
    }

    if (!question) return; // Should not happen

    const correctOption = question.options.find(opt => opt.isCorrect);
    // Flexible matching: trim whitespace and case-insensitive check optional but safer
    // Note: options usually case-sensitive, but let's be strict first.
    // Actually, let's normalize by trimming.
    const selected = (answer.selectedAnswer || '').trim();
    const correctText = (correctOption ? correctOption.text : question.correctAnswer || '').trim();

    const isCorrect = selected === correctText;
    const pointsEarned = isCorrect ? question.points : 0;

    score += pointsEarned;
    totalPoints += question.points;

    processedAnswers.push({
      questionId: question._id,
      selectedAnswer: answer.selectedAnswer,
      isCorrect,
      timeSpent: answer.timeSpent || 0,
      pointsEarned
    });
  });

  const percentage = Math.round((score / totalPoints) * 100);

  // Calculate XP with bonuses
  let xpEarned = score; // Base XP = score
  if (percentage === 100) xpEarned += 50; // Perfect score bonus
  if (timeSpent < quiz.timeLimit * 30) xpEarned += 20; // Speed bonus

  return {
    answers: processedAnswers,
    score,
    percentage,
    xpEarned,
    feedback: generateFeedback(percentage, timeSpent, quiz.timeLimit),
    perfect: percentage === 100,
    fast: timeSpent < quiz.timeLimit * 30
  };
};

const generateFeedback = (percentage, timeSpent, timeLimit) => {
  const timeRatio = timeSpent / (timeLimit * 60);

  if (percentage >= 90) {
    return timeRatio < 0.5 ?
      "Excellent! Perfect score and lightning fast! 🚀" :
      "Excellent work! Great accuracy! 🎯";
  } else if (percentage >= 80) {
    return "Great job! You're doing really well! 👍";
  } else if (percentage >= 70) {
    return "Good effort! Keep practicing to improve! 💪";
  } else {
    return "Don't give up! Practice makes perfect! 🌟";
  }
};

const calculateStreak = async (userId) => {
  const user = await User.findById(userId);
  const currentStreak = user.learningStats?.streak || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if user has completed a quiz today
  const todayAttempts = await QuizAttempt.find({
    userId,
    completedAt: { $gte: today }
  });

  if (todayAttempts.length > 0) {
    // User has completed a quiz today, maintain or increase streak
    return currentStreak;
  }

  // Check if user completed a quiz yesterday
  const yesterdayAttempts = await QuizAttempt.find({
    userId,
    completedAt: { $gte: yesterday, $lt: today }
  });

  if (yesterdayAttempts.length > 0) {
    // User completed yesterday, maintain streak
    return currentStreak;
  }

  // Check for streak freeze
  if (user.learningStats?.streakFreeze > 0) {
    // Use streak freeze
    user.learningStats.streakFreeze -= 1;
    await user.save();
    return currentStreak;
  }

  // No streak freeze available, reset streak
  return 0;
};

const updateUserStats = async (userId, quizAttempt) => {
  const user = await User.findById(userId);

  // Update basic stats
  user.learningStats.QuizesCompleted += 1;
  user.learningStats.totalXP += quizAttempt.xpEarned;
  user.learningStats.weeklyXP += quizAttempt.xpEarned;
  user.learningStats.monthlyXP += quizAttempt.xpEarned;

  if (quizAttempt.percentage === 100) {
    user.learningStats.perfectQuizes += 1;
  }

  // Update streak
  user.learningStats.streak = quizAttempt.streak;
  if (quizAttempt.streak > user.learningStats.longestStreak) {
    user.learningStats.longestStreak = quizAttempt.streak;
  }

  // Update category progress
  const categoryKey = quizAttempt.category;
  if (user.learningStats.categoryProgress[categoryKey] !== undefined) {
    user.learningStats.categoryProgress[categoryKey] += quizAttempt.xpEarned;
  }

  // Update recent Quizes (keep last 10)
  user.learningStats.recentQuizes.unshift({
    quizId: quizAttempt.quizId,
    score: quizAttempt.percentage,
    completedAt: quizAttempt.completedAt,
    category: quizAttempt.category
  });
  user.learningStats.recentQuizes = user.learningStats.recentQuizes.slice(0, 10);

  // Recalculate average quiz score
  const allAttempts = await QuizAttempt.find({ userId });
  const totalScore = allAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
  user.learningStats.averageQuizScore = Math.round(totalScore / allAttempts.length);

  // Update level based on total XP using shared utility
  const newLevel = calculateLevel(user.learningStats.totalXP);
  user.learningStats.level = Math.max(user.learningStats.level || 1, newLevel);
  user.learningStats.xpToNextLevel = calculateXPToNextLevel(user.learningStats.totalXP);

  await user.save();
};

const checkAchievements = async (userId, quizAttempt) => {
  const achievements = await Achievement.find({ isActive: true });
  const newAchievements = [];

  for (const achievement of achievements) {
    // Check if user already has this achievement
    const existingAchievement = await UserAchievement.findOne({
      userId,
      achievementId: achievement._id
    });

    if (existingAchievement) continue;

    let isEarned = false;
    let progress = 0;

    switch (achievement.requirements.type) {
      case 'score':
        if (quizAttempt.percentage >= achievement.requirements.value) {
          isEarned = true;
        }
        break;
      case 'streak':
        if (quizAttempt.streak >= achievement.requirements.value) {
          isEarned = true;
        }
        break;
      case 'completion':
        const totalQuizes = await QuizAttempt.countDocuments({ userId });
        if (totalQuizes >= achievement.requirements.value) {
          isEarned = true;
        }
        progress = Math.min(100, (totalQuizes / achievement.requirements.value) * 100);
        break;
      // Add more achievement types as needed
    }

    if (isEarned || progress > 0) {
      const userAchievement = new UserAchievement({
        userId,
        achievementId: achievement._id,
        progress,
        isCompleted: isEarned,
        xpEarned: isEarned ? achievement.xpReward : 0
      });

      await userAchievement.save();

      if (isEarned) {
        newAchievements.push(achievement);

        // Add XP reward
        const user = await User.findById(userId);
        user.learningStats.totalXP += achievement.xpReward;
        user.learningStats.achievements.push(userAchievement._id);
        if (achievement.badge) {
          user.learningStats.badges.push(achievement.badge);
        }
        await user.save();
      }
    }
  }

  return newAchievements;
};

const updateQuizStats = async (quizId, percentage) => {
  const quiz = await Quiz.findById(quizId);

  quiz.stats.totalAttempts += 1;

  // Update average score
  const allAttempts = await QuizAttempt.find({ quizId });
  const totalScore = allAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
  quiz.stats.averageScore = Math.round(totalScore / allAttempts.length);

  // Update completion rate
  const completedAttempts = allAttempts.filter(attempt => attempt.passed).length;
  quiz.stats.completionRate = Math.round((completedAttempts / allAttempts.length) * 100);

  await quiz.save();
};

// Check if user has completed all modules in a specific level
const checkLevelMasteryQuizUnlock = async (userId, targetLevel) => {
  try {
    logger.info(`🔍 Checking Level ${targetLevel} mastery quiz unlock for user ${userId}`, null, 'CONTROLLER');

    // Get all skills in the target level
    const skillsInLevel = await Skill.find({
      level: targetLevel,
      isActive: true
    }).sort({ order: 1 });

    if (skillsInLevel.length === 0) {
      logger.info(`❌ No skills found for Level ${targetLevel}`, null, 'CONTROLLER');
      return false;
    }

    logger.info(`📚 Found ${skillsInLevel.length} skills in Level ${targetLevel}`, null, 'CONTROLLER');

    // Get user progress
    const userProgress = await UserSkillProgress.findOne({ user: userId });
    if (!userProgress) {
      logger.info(`❌ No user progress found for user ${userId}`, null, 'CONTROLLER');
      return false;
    }

    // Check if all skills in the level are completed
    const completedSkillsInLevel = skillsInLevel.filter(skill =>
      userProgress.skills.some(sp =>
        sp.skill.toString() === skill._id.toString() && sp.isCompleted === true && sp.isRelearning === false
      )
    );

    const allCompleted = completedSkillsInLevel.length === skillsInLevel.length;

    logger.info(`📊 Level ${targetLevel} completion: ${completedSkillsInLevel.length}/${skillsInLevel.length} skills completed`, null, 'CONTROLLER');
    logger.info(`🔓 Level ${targetLevel} mastery quiz unlocked: ${allCompleted}`, null, 'CONTROLLER');

    return allCompleted;

  } catch (error) {
    logger.errorWithStack('Error checking level mastery quiz unlock:', error, error, 'CONTROLLER');
    return false;
  }
};

// Purchase streak freeze
export const purchaseStreakFreeze = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const xpCost = 100; // Cost in XP for one streak freeze

    if (user.learningStats.totalXP < xpCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient XP. Need 100 XP to purchase streak freeze.'
      });
    }

    // Deduct XP and add streak freeze
    user.learningStats.totalXP -= xpCost;
    user.learningStats.streakFreeze += 1;

    await user.save();

    res.json({
      success: true,
      message: 'Streak freeze purchased successfully!',
      data: {
        streakFreeze: user.learningStats.streakFreeze,
        totalXP: user.learningStats.totalXP,
        xpSpent: xpCost
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
