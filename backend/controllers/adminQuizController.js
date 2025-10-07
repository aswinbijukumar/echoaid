import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import QuestionBank from '../models/QuestionBank.js';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';

// Get all quizzes for admin management
export const getAdminQuizzes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      category,
      difficulty,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name email')
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

// Create new quiz
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      tags
    } = req.body;

    const quiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      tags,
      createdBy: req.user.id
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Also delete related quiz attempts
    await QuizAttempt.deleteMany({ quizId: id });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle quiz status
export const toggleQuizStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.json({
      success: true,
      message: `Quiz ${quiz.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: quiz.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz analytics
export const getQuizAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Get detailed analytics
    const attempts = await QuizAttempt.find({ quizId: id })
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .lean();

    const analytics = {
      basic: {
        totalAttempts: attempts.length,
        averageScore: quiz.stats.averageScore,
        completionRate: quiz.stats.completionRate,
        totalQuestions: quiz.questions.length,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore
      },
      performance: {
        scoreDistribution: getScoreDistribution(attempts),
        timeDistribution: getTimeDistribution(attempts),
        difficultyBreakdown: getDifficultyBreakdown(attempts),
        categoryPerformance: getCategoryPerformance(attempts)
      },
      recentAttempts: attempts.slice(0, 10),
      topPerformers: getTopPerformers(attempts),
      questionAnalysis: await getQuestionAnalysis(quiz, attempts)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get overall quiz analytics dashboard
export const getQuizDashboard = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const dateFilter = getDateFilter(timeframe);
    
    // Overall statistics
    const totalQuizzes = await Quiz.countDocuments();
    const activeQuizzes = await Quiz.countDocuments({ isActive: true });
    const totalAttempts = await QuizAttempt.countDocuments({
      completedAt: { $gte: dateFilter }
    });
    
    // Performance metrics
    const avgScore = await QuizAttempt.aggregate([
      { $match: { completedAt: { $gte: dateFilter } } },
      { $group: { _id: null, average: { $avg: '$percentage' } } }
    ]);

    // Category breakdown
    const categoryStats = await QuizAttempt.aggregate([
      { $match: { completedAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: '$category',
          attempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
          totalXP: { $sum: '$xpEarned' }
        }
      }
    ]);

    // Difficulty breakdown
    const difficultyStats = await QuizAttempt.aggregate([
      { $match: { completedAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: '$difficulty',
          attempts: { $sum: 1 },
          avgScore: { $avg: '$percentage' }
        }
      }
    ]);

    // Recent activity
    const recentActivity = await QuizAttempt.find({
      completedAt: { $gte: dateFilter }
    })
      .populate('userId', 'name')
      .populate('quizId', 'title')
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    // Top performing quizzes
    const topQuizzes = await Quiz.aggregate([
      {
        $lookup: {
          from: 'quizattempts',
          localField: '_id',
          foreignField: 'quizId',
          as: 'attempts'
        }
      },
      {
        $match: {
          'attempts.completedAt': { $gte: dateFilter }
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          difficulty: 1,
          totalAttempts: { $size: '$attempts' },
          avgScore: { $avg: '$attempts.percentage' },
          completionRate: {
            $multiply: [
              { $divide: [{ $size: { $filter: { input: '$attempts', cond: { $gte: ['$$this.percentage', '$passingScore'] } } } }, { $size: '$attempts' }] },
              100
            ]
          }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalQuizzes,
          activeQuizzes,
          totalAttempts,
          averageScore: avgScore[0]?.average || 0
        },
        categoryStats,
        difficultyStats,
        recentActivity,
        topQuizzes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Question Bank Management
export const getQuestionBank = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      difficulty,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (type && type !== 'all') filter.type = type;
    
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const questions = await QuestionBank.find(filter)
      .populate('createdBy', 'name')
      .populate('signReference', 'word imageUrl')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await QuestionBank.countDocuments(filter);

    res.json({
      success: true,
      data: questions,
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

// Create question in bank
export const createQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user.id
    };

    const question = new QuestionBank(questionData);
    await question.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const question = await QuestionBank.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await QuestionBank.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper Functions

const getDateFilter = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0);
  }
};

const getScoreDistribution = (attempts) => {
  const ranges = [
    { range: '0-20', count: 0 },
    { range: '21-40', count: 0 },
    { range: '41-60', count: 0 },
    { range: '61-80', count: 0 },
    { range: '81-100', count: 0 }
  ];

  attempts.forEach(attempt => {
    const score = attempt.percentage;
    if (score <= 20) ranges[0].count++;
    else if (score <= 40) ranges[1].count++;
    else if (score <= 60) ranges[2].count++;
    else if (score <= 80) ranges[3].count++;
    else ranges[4].count++;
  });

  return ranges;
};

const getTimeDistribution = (attempts) => {
  const ranges = [
    { range: '0-5 min', count: 0 },
    { range: '5-10 min', count: 0 },
    { range: '10-15 min', count: 0 },
    { range: '15+ min', count: 0 }
  ];

  attempts.forEach(attempt => {
    const minutes = attempt.timeSpent / 60;
    if (minutes <= 5) ranges[0].count++;
    else if (minutes <= 10) ranges[1].count++;
    else if (minutes <= 15) ranges[2].count++;
    else ranges[3].count++;
  });

  return ranges;
};

const getDifficultyBreakdown = (attempts) => {
  const breakdown = {};
  attempts.forEach(attempt => {
    if (!breakdown[attempt.difficulty]) {
      breakdown[attempt.difficulty] = { count: 0, totalScore: 0 };
    }
    breakdown[attempt.difficulty].count++;
    breakdown[attempt.difficulty].totalScore += attempt.percentage;
  });

  Object.keys(breakdown).forEach(key => {
    breakdown[key].averageScore = Math.round(breakdown[key].totalScore / breakdown[key].count);
  });

  return breakdown;
};

const getCategoryPerformance = (attempts) => {
  const performance = {};
  attempts.forEach(attempt => {
    if (!performance[attempt.category]) {
      performance[attempt.category] = { count: 0, totalScore: 0 };
    }
    performance[attempt.category].count++;
    performance[attempt.category].totalScore += attempt.percentage;
  });

  Object.keys(performance).forEach(key => {
    performance[key].averageScore = Math.round(performance[key].totalScore / performance[key].count);
  });

  return performance;
};

const getTopPerformers = (attempts) => {
  const userScores = {};
  
  attempts.forEach(attempt => {
    const userId = attempt.userId._id || attempt.userId;
    if (!userScores[userId]) {
      userScores[userId] = {
        name: attempt.userId.name || 'Unknown',
        attempts: 0,
        totalScore: 0,
        bestScore: 0
      };
    }
    userScores[userId].attempts++;
    userScores[userId].totalScore += attempt.percentage;
    userScores[userId].bestScore = Math.max(userScores[userId].bestScore, attempt.percentage);
  });

  return Object.values(userScores)
    .map(user => ({
      ...user,
      averageScore: Math.round(user.totalScore / user.attempts)
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10);
};

const getQuestionAnalysis = async (quiz, attempts) => {
  const questionStats = quiz.questions.map(question => {
    const questionAttempts = attempts.filter(attempt => 
      attempt.answers.some(answer => 
        answer.questionId.toString() === question._id.toString()
      )
    );

    const correctAnswers = questionAttempts.filter(attempt => {
      const answer = attempt.answers.find(a => 
        a.questionId.toString() === question._id.toString()
      );
      return answer && answer.isCorrect;
    }).length;

    const totalAnswers = questionAttempts.length;
    const successRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    return {
      questionId: question._id,
      question: question.question,
      successRate,
      totalAttempts: totalAnswers,
      correctAnswers,
      difficulty: question.difficulty,
      points: question.points
    };
  });

  return questionStats.sort((a, b) => a.successRate - b.successRate);
};