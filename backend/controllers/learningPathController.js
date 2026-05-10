import LearningPath from '../models/LearningPath.js';
import logger from '../utils/prettyLogger.js';
import Unit from '../models/Unit.js';
import Lesson from '../models/Lesson.js';
import Exercise from '../models/Exercise.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import { calculateLevel } from '../utils/gamificationUtils.js';


// Get all learning paths with user progress
export const getLearningPaths = async (req, res) => {
  try {
    const userId = req.user.id;
    const { difficulty, language } = req.query;

    // Build filter
    const filter = { isActive: true, isPublished: true };
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;

    const learningPaths = await LearningPath.find(filter)
      .populate('units', 'title order totalLessons totalExercises')
      .sort({ order: 1 });

    // Get user progress
    const userProgress = await UserProgress.findOne({ user: userId });

    const pathsWithProgress = learningPaths.map(path => {
      const userPathProgress = userProgress?.learningPaths.find(
        lp => lp.learningPath.toString() === path._id.toString()
      );

      return {
        ...path.toObject(),
        isEnrolled: !!userPathProgress,
        progress: userPathProgress?.progress || 0,
        currentUnit: userPathProgress?.currentUnit,
        currentLesson: userPathProgress?.currentLesson,
        enrolledAt: userPathProgress?.enrolledAt,
        lastActiveAt: userPathProgress?.lastActiveAt
      };
    });

    res.status(200).json({
      success: true,
      data: pathsWithProgress
    });
  } catch (error) {
    logger.errorWithStack('Get learning paths error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single learning path with detailed structure
export const getLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const learningPath = await LearningPath.findById(id)
      .populate({
        path: 'units',
        populate: {
          path: 'lessons',
          populate: {
            path: 'exercises',
            select: 'title type difficulty xpReward order'
          }
        }
      });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Get user progress for this path
    const userProgress = await UserProgress.findOne({ user: userId });
    const userPathProgress = userProgress?.learningPaths.find(
      lp => lp.learningPath.toString() === id
    );

    // Add progress information to units and lessons
    const unitsWithProgress = await Promise.all(learningPath.units.map(async unit => {
      const completedUnit = userPathProgress?.completedUnits.find(
        cu => cu.unit.toString() === unit._id.toString()
      );

      const lessonsWithProgress = unit.lessons.map(lesson => {
        const completedLesson = userPathProgress?.completedLessons.find(
          cl => cl.lesson.toString() === lesson._id.toString()
        );

        return {
          ...lesson.toObject(),
          isCompleted: !!completedLesson,
          score: completedLesson?.score || 0,
          completedAt: completedLesson?.completedAt,
          isUnlocked: checkLessonUnlock(lesson, userPathProgress, unit)
        };
      });

      return {
        ...unit.toObject(),
        lessons: lessonsWithProgress,
        isCompleted: !!completedUnit,
        score: completedUnit?.score || 0,
        completedAt: completedUnit?.completedAt,
        isUnlocked: await checkUnitUnlock(unit, userPathProgress, userId)
      };
    }));

    const pathWithProgress = {
      ...learningPath.toObject(),
      units: unitsWithProgress,
      isEnrolled: !!userPathProgress,
      progress: userPathProgress?.progress || 0,
      currentUnit: userPathProgress?.currentUnit,
      currentLesson: userPathProgress?.currentLesson,
      enrolledAt: userPathProgress?.enrolledAt,
      lastActiveAt: userPathProgress?.lastActiveAt
    };

    res.status(200).json({
      success: true,
      data: pathWithProgress
    });
  } catch (error) {
    logger.errorWithStack('Get learning path error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Enroll in a learning path
export const enrollInLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const learningPath = await LearningPath.findById(id);
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Check if user is already enrolled
    let userProgress = await UserProgress.findOne({ user: userId });
    if (!userProgress) {
      userProgress = new UserProgress({ user: userId });
    }

    const existingEnrollment = userProgress.learningPaths.find(
      lp => lp.learningPath.toString() === id
    );

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this learning path'
      });
    }

    // Check prerequisites
    const canEnroll = checkLearningPathPrerequisites(learningPath, userProgress);
    if (!canEnroll) {
      return res.status(400).json({
        success: false,
        message: 'Prerequisites not met for this learning path'
      });
    }

    // Enroll user
    userProgress.learningPaths.push({
      learningPath: id,
      enrolledAt: new Date(),
      lastActiveAt: new Date()
    });

    await userProgress.save();

    // Update learning path stats
    await LearningPath.findByIdAndUpdate(id, {
      $inc: { 'stats.totalEnrollments': 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in learning path',
      data: {
        learningPath: id,
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    logger.errorWithStack('Enroll in learning path error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current lesson for user
export const getCurrentLesson = async (req, res) => {
  try {
    const { pathId } = req.params;
    const userId = req.user.id;

    const userProgress = await UserProgress.findOne({ user: userId });
    const userPathProgress = userProgress?.learningPaths.find(
      lp => lp.learningPath.toString() === pathId
    );

    if (!userPathProgress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this learning path'
      });
    }

    // Get current lesson with exercises
    const currentLesson = await Lesson.findById(userPathProgress.currentLesson)
      .populate('exercises', 'title type difficulty content xpReward order')
      .populate('signs', 'word category coverImage');

    if (!currentLesson) {
      // Find next available lesson
      const learningPath = await LearningPath.findById(pathId).populate('units');
      const nextLesson = findNextAvailableLesson(learningPath, userPathProgress);

      if (nextLesson) {
        // Update user progress to next lesson
        userPathProgress.currentLesson = nextLesson._id;
        await userProgress.save();

        const lessonWithExercises = await Lesson.findById(nextLesson._id)
          .populate('exercises', 'title type difficulty content xpReward order')
          .populate('signs', 'word category coverImage');

        return res.status(200).json({
          success: true,
          data: lessonWithExercises
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Learning path completed!',
          data: null
        });
      }
    }

    res.status(200).json({
      success: true,
      data: currentLesson
    });
  } catch (error) {
    logger.errorWithStack('Get current lesson error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete an exercise
export const completeExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { score, timeSpent, accuracy } = req.body;
    const userId = req.user.id;

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // SECURITY CHECK: Prevent instant completion exploits
    // Minimum reasonable time: 5 seconds (unless it's a very simple flashcard, but even then)
    if (timeSpent < 5 && exercise.type !== 'flashcard') {
      logger.warn(`Suspicious activity: User ${userId} completed exercise ${exerciseId} in ${timeSpent}s`, null, 'SECURITY');
      return res.status(400).json({
        success: false,
        message: 'Exercise completed too quickly. Please review the material properly.'
      });
    }

    // Calculate XP earned
    const xpEarned = Math.round((score / 100) * exercise.xpReward);

    // Update user progress
    let userProgress = await UserProgress.findOne({ user: userId });
    if (!userProgress) {
      userProgress = new UserProgress({ user: userId });
    }

    // Find the learning path progress
    const lesson = await Lesson.findById(exercise.lesson);
    const unit = await Unit.findById(lesson.unit);
    const learningPath = await LearningPath.findById(unit.learningPath);

    let userPathProgress = userProgress.learningPaths.find(
      lp => lp.learningPath.toString() === learningPath._id.toString()
    );

    if (!userPathProgress) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this learning path'
      });
    }

    // Add completed exercise
    const existingExerciseIndex = userPathProgress.completedExercises.findIndex(
      ce => ce.exercise.toString() === exerciseId
    );

    if (existingExerciseIndex >= 0) {
      userPathProgress.completedExercises[existingExerciseIndex] = {
        exercise: exerciseId,
        completedAt: new Date(),
        score,
        attempts: userPathProgress.completedExercises[existingExerciseIndex].attempts + 1,
        xpEarned,
        timeSpent,
        accuracy
      };
    } else {
      userPathProgress.completedExercises.push({
        exercise: exerciseId,
        completedAt: new Date(),
        score,
        attempts: 1,
        xpEarned,
        timeSpent,
        accuracy
      });
    }

    // Update overall stats
    userProgress.overall.totalXP += xpEarned;
    userProgress.overall.totalExercisesCompleted += 1;
    userProgress.overall.totalTimeSpent += Math.round(timeSpent / 60); // Convert to minutes
    userProgress.overall.lastActiveDate = new Date();

    // Update daily goals
    const today = new Date().toDateString();
    const lastReset = new Date(userProgress.dailyGoals.lastResetDate).toDateString();

    if (today !== lastReset) {
      userProgress.dailyGoals.current = 0;
      userProgress.dailyGoals.lastResetDate = new Date();
    }

    userProgress.dailyGoals.current += 1;

    // Check for level up using shared utility
    const newLevel = calculateLevel(userProgress.overall.totalXP);
    const leveledUp = newLevel > userProgress.overall.level;
    userProgress.overall.level = newLevel;

    // Update streak
    const lastActive = new Date(userProgress.overall.lastActiveDate);
    const todayDate = new Date();
    const daysDiff = Math.floor((todayDate - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      userProgress.overall.streak += 1;
      userProgress.overall.maxStreak = Math.max(userProgress.overall.maxStreak, userProgress.overall.streak);
    } else if (daysDiff > 1) {
      userProgress.overall.streak = 1;
    }

    // Check if lesson is completed
    const lessonExercises = await Exercise.find({ lesson: lesson._id });
    const completedLessonExercises = userPathProgress.completedExercises.filter(
      ce => lessonExercises.some(le => le._id.toString() === ce.exercise.toString())
    );

    let lessonCompleted = false;
    if (completedLessonExercises.length === lessonExercises.length) {
      // Lesson completed
      const existingLessonIndex = userPathProgress.completedLessons.findIndex(
        cl => cl.lesson.toString() === lesson._id.toString()
      );

      if (existingLessonIndex >= 0) {
        userPathProgress.completedLessons[existingLessonIndex] = {
          lesson: lesson._id,
          completedAt: new Date(),
          score: Math.round(completedLessonExercises.reduce((sum, ce) => sum + ce.score, 0) / completedLessonExercises.length),
          attempts: 1,
          xpEarned: lesson.xpReward,
          timeSpent: Math.round(completedLessonExercises.reduce((sum, ce) => sum + ce.timeSpent, 0) / 60)
        };
      } else {
        userPathProgress.completedLessons.push({
          lesson: lesson._id,
          completedAt: new Date(),
          score: Math.round(completedLessonExercises.reduce((sum, ce) => sum + ce.score, 0) / completedLessonExercises.length),
          attempts: 1,
          xpEarned: lesson.xpReward,
          timeSpent: Math.round(completedLessonExercises.reduce((sum, ce) => sum + ce.timeSpent, 0) / 60)
        });
      }

      userProgress.overall.totalXP += lesson.xpReward;
      userProgress.overall.totalLessonsCompleted += 1;
      lessonCompleted = true;

      // Update current lesson to next available
      const nextLesson = findNextAvailableLesson(learningPath, userPathProgress);
      if (nextLesson) {
        userPathProgress.currentLesson = nextLesson._id;
      }
    }

    await userProgress.save();

    // Update User model learning stats (ensure consistency)
    await User.findByIdAndUpdate(userId, {
      $set: {
        'learningStats.totalXP': userProgress.overall.totalXP,
        'learningStats.level': userProgress.overall.level,
        'learningStats.lastActiveDate': userProgress.overall.lastActiveDate,
        'learningStats.xpToNextLevel': Math.max(0, (userProgress.overall.level * 1000) - userProgress.overall.totalXP)
      }
    });

    res.status(200).json({
      success: true,
      data: {
        exerciseCompleted: true,
        score,
        xpEarned,
        leveledUp,
        newLevel: userProgress.overall.level,
        lessonCompleted,
        totalXP: userProgress.overall.totalXP,
        dailyGoalProgress: {
          current: userProgress.dailyGoals.current,
          target: userProgress.dailyGoals.target
        }
      }
    });
  } catch (error) {
    logger.errorWithStack('Complete exercise error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper functions
const checkLearningPathPrerequisites = (learningPath, userProgress) => {
  if (!userProgress) return learningPath.order === 1;

  // Check prerequisites
  const completedPathIds = userProgress.learningPaths
    .filter(lp => lp.completedAt)
    .map(lp => lp.learningPath.toString());

  const hasPrerequisites = learningPath.prerequisites.every(prereq =>
    completedPathIds.includes(prereq.toString())
  );

  // Check level and XP requirements
  const meetsLevel = userProgress.overall.level >= learningPath.unlockRequirements.minLevel;
  const meetsXP = userProgress.overall.totalXP >= learningPath.unlockRequirements.minXP;

  return hasPrerequisites && meetsLevel && meetsXP;
};

const checkUnitUnlock = async (unit, userPathProgress, userId) => {
  if (!userPathProgress) {
    // SELF-HEALING: Check if user has a certificate for this level/unit
    if (userId) {
      const hasCert = await Certificate.findOne({
        user: userId,
        $or: [
          { title: new RegExp(unit.title, 'i') },
          { title: new RegExp(`Level ${unit.level}`, 'i') }
        ]
      });
      if (hasCert) return true;
    }
    return unit.level === 0 && unit.order === 1;
  }

  // Check prerequisites
  const completedUnitIds = userPathProgress.completedUnits.map(cu => cu.unit.toString());
  const hasPrerequisites = unit.prerequisites.every(prereq =>
    completedUnitIds.includes(prereq.toString())
  );

  return hasPrerequisites;
};

const checkLessonUnlock = (lesson, userPathProgress, unit) => {
  // If unit is unlocked via Certificate/order, and it's the first lesson, allow it
  if (!userPathProgress) return lesson.order === 1;

  // Prerequisites check
  const completedLessonIds = userPathProgress.completedLessons.map(cl => cl.lesson.toString());
  
  // If it's the first lesson of a unit, it's unlocked if the unit is accessible
  if (lesson.order === 1) return true;

  const hasPrerequisites = lesson.prerequisites.every(prereq =>
    completedLessonIds.includes(prereq.toString())
  );

  return hasPrerequisites;
};

const findNextAvailableLesson = (learningPath, userPathProgress) => {
  const completedLessonIds = userPathProgress.completedLessons.map(cl => cl.lesson.toString());

  for (const unit of learningPath.units) {
    for (const lesson of unit.lessons) {
      if (!completedLessonIds.includes(lesson._id.toString()) &&
        checkLessonUnlock(lesson, userPathProgress, unit)) {
        return lesson;
      }
    }
  }

  return null;
};
