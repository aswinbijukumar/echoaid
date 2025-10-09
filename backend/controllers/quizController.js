import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import QuestionBank from '../models/QuestionBank.js';

// Get all quizzes with filtering and pagination
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

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

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

  // Simple gating: require prior passes in category for higher difficulties
  if (quiz.difficulty === 'Intermediate' || quiz.difficulty === 'Advanced') {
    const requiredPasses = quiz.difficulty === 'Advanced' ? 3 : 2;
    const passes = await QuizAttempt.countDocuments({ userId, category: quiz.category, passed: true });
    if (passes < requiredPasses) {
      return res.status(403).json({
        success: false,
        message: `Unlock requirement: Pass ${requiredPasses} ${quiz.category} quiz${requiredPasses>1?'zes':''} to access ${quiz.difficulty}.`,
        data: { requiredPasses, currentPasses: passes, category: quiz.category, difficulty: quiz.difficulty }
      });
    }
  }

    // Check if user has remaining attempts
    const attempts = await QuizAttempt.find({ userId, quizId });
    if (attempts.length >= quiz.maxAttempts) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum attempts reached for this quiz' 
      });
    }

    // Get adaptive questions based on user performance
    const user = await User.findById(userId);
    const adaptiveQuestions = await getAdaptiveQuestions(quiz, user);

  // Compute today's XP for daily ring
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const todayAttempts = await QuizAttempt.find({ userId, completedAt: { $gte: startOfDay } }, { xpEarned: 1 }).lean();
  const xpToday = todayAttempts.reduce((s,a)=> s + (a.xpEarned||0), 0);

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
      xpEarned: results.xpEarned,
      difficulty: quiz.difficulty,
      category: quiz.category
    });

    await quizAttempt.save();

    // Update user stats and check achievements
    await updateUserStats(userId, quizAttempt);
    const newAchievements = await checkAchievements(userId, quizAttempt);

    // Update quiz stats
    await updateQuizStats(quizId, results.percentage);

    // Fetch updated user stats to return to client for gamification UI
    const updatedUser = await User.findById(userId).lean();
    const learningStats = updatedUser?.learningStats || {};
    const levelUp = (learningStats.level || 1) > prevLevel;

    res.json({
      success: true,
      data: {
        attemptId: quizAttempt._id,
        score: results.score,
        percentage: results.percentage,
        passed: quizAttempt.passed,
        xpEarned: results.xpEarned,
        streak: quizAttempt.streak,
        feedback: results.feedback,
        perfect: results.perfect,
        fast: results.fast,
        newAchievements,
        timeSpent,
        learningStats,
        levelUp
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
          quizzesCompleted: user.learningStats.quizzesCompleted,
          perfectQuizzes: user.learningStats.perfectQuizzes,
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
  if (!user.learningStats.recentQuizzes || user.learningStats.recentQuizzes.length === 0) {
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
    const question = quiz.questions[index];
    const isCorrect = answer.selectedAnswer === question.correctAnswer;
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
  user.learningStats.quizzesCompleted += 1;
  user.learningStats.totalXP += quizAttempt.xpEarned;
  user.learningStats.weeklyXP += quizAttempt.xpEarned;
  user.learningStats.monthlyXP += quizAttempt.xpEarned;
  
  if (quizAttempt.percentage === 100) {
    user.learningStats.perfectQuizzes += 1;
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

  // Update recent quizzes (keep last 10)
  user.learningStats.recentQuizzes.unshift({
    quizId: quizAttempt.quizId,
    score: quizAttempt.percentage,
    completedAt: quizAttempt.completedAt,
    category: quizAttempt.category
  });
  user.learningStats.recentQuizzes = user.learningStats.recentQuizzes.slice(0, 10);

  // Recalculate average quiz score
  const allAttempts = await QuizAttempt.find({ userId });
  const totalScore = allAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
  user.learningStats.averageQuizScore = Math.round(totalScore / allAttempts.length);

  // Update level and xpToNextLevel consistently
  const newLevel = Math.floor(user.learningStats.totalXP / 1000) + 1;
  user.learningStats.level = Math.max(user.learningStats.level || 1, newLevel);
  user.learningStats.xpToNextLevel = Math.max(0, (user.learningStats.level * 1000) - user.learningStats.totalXP);

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
        const totalQuizzes = await QuizAttempt.countDocuments({ userId });
        if (totalQuizzes >= achievement.requirements.value) {
          isEarned = true;
        }
        progress = Math.min(100, (totalQuizzes / achievement.requirements.value) * 100);
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