import Unit from '../models/Unit.js';
import logger from '../utils/prettyLogger.js';
import Lesson from '../models/Lesson.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';
import Sign from '../models/Sign.js';
import LearningPath from '../models/LearningPath.js'; // Needed for createUnit linkage

// Get all units with user progress
export const getUnits = async (req, res) => {
  try {
    const userId = req.user.id;
    const units = await Unit.find({ isActive: true })
      .populate('lessons', 'title order')
      .sort({ order: 1 });

    // Get user progress
    const userProgress = await UserProgress.findOne({ user: userId });

    const unitsWithProgress = units.map(unit => {
      const completedUnit = userProgress?.curriculum.completedUnits.find(
        cu => cu.unit.toString() === unit._id.toString()
      );

      const isUnlocked = checkUnitUnlock(unit, userProgress);

      return {
        ...unit.toObject(),
        isCompleted: !!completedUnit,
        isUnlocked,
        progress: completedUnit ? 100 : 0,
        completedAt: completedUnit?.completedAt,
        score: completedUnit?.score
      };
    });

    res.status(200).json({
      success: true,
      data: unitsWithProgress
    });
  } catch (error) {
    logger.errorWithStack('Get units error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single unit with lessons
export const getUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const userId = req.user.id;

    const unit = await Unit.findById(unitId)
      .populate({
        path: 'lessons',
        populate: {
          path: 'signs',
          select: 'word category difficulty imagePath videoPath'
        }
      });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Get user progress for lessons
    const userProgress = await UserProgress.findOne({ user: userId });

    const lessonsWithProgress = unit.lessons.map(lesson => {
      const completedLesson = userProgress?.curriculum.completedLessons.find(
        cl => cl.lesson.toString() === lesson._id.toString()
      );

      const isUnlocked = checkLessonUnlock(lesson, userProgress);

      return {
        ...lesson.toObject(),
        isCompleted: !!completedLesson,
        isUnlocked,
        progress: completedLesson ? 100 : 0,
        completedAt: completedLesson?.completedAt,
        score: completedLesson?.score
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...unit.toObject(),
        lessons: lessonsWithProgress
      }
    });
  } catch (error) {
    logger.errorWithStack('Get unit error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single lesson with exercises
export const getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId)
      .populate('unit', 'title level')
      .populate('signs', 'word description imagePath videoPath');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if lesson is unlocked
    const userProgress = await UserProgress.findOne({ user: userId });
    const isUnlocked = checkLessonUnlock(lesson, userProgress);

    if (!isUnlocked) {
      return res.status(403).json({
        success: false,
        message: 'Lesson is locked. Complete prerequisites first.'
      });
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.errorWithStack('Get lesson error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete lesson
export const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { score, timeSpent, exercises } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Calculate XP earned
    const xpEarned = Math.round((score / 100) * lesson.xpReward);

    // Update user progress
    let userProgress = await UserProgress.findOne({ user: userId });
    if (!userProgress) {
      userProgress = new UserProgress({ user: userId });
    }

    // Add completed lesson
    const existingLessonIndex = userProgress.curriculum.completedLessons.findIndex(
      cl => cl.lesson.toString() === lessonId
    );

    if (existingLessonIndex >= 0) {
      userProgress.curriculum.completedLessons[existingLessonIndex] = {
        lesson: lessonId,
        completedAt: new Date(),
        score,
        attempts: userProgress.curriculum.completedLessons[existingLessonIndex].attempts + 1,
        xpEarned
      };
    } else {
      userProgress.curriculum.completedLessons.push({
        lesson: lessonId,
        completedAt: new Date(),
        score,
        attempts: 1,
        xpEarned
      });
    }

    // Update overall stats
    userProgress.overall.totalXP += xpEarned;
    userProgress.overall.lastActiveDate = new Date();

    // Check for level up
    const newLevel = Math.floor(userProgress.overall.totalXP / 1000) + 1;
    const leveledUp = newLevel > userProgress.overall.level;
    userProgress.overall.level = newLevel;

    // Check if unit is completed
    const unit = await Unit.findById(lesson.unit);
    const unitLessons = await Lesson.find({ unit: lesson.unit });
    const completedUnitLessons = userProgress.curriculum.completedLessons.filter(
      cl => unitLessons.some(ul => ul._id.toString() === cl.lesson.toString())
    );

    let unitCompleted = false;
    if (completedUnitLessons.length === unitLessons.length) {
      // Unit completed
      const existingUnitIndex = userProgress.curriculum.completedUnits.findIndex(
        cu => cu.unit.toString() === lesson.unit.toString()
      );

      if (existingUnitIndex >= 0) {
        userProgress.curriculum.completedUnits[existingUnitIndex] = {
          unit: lesson.unit,
          completedAt: new Date(),
          score: Math.round(completedUnitLessons.reduce((sum, cl) => sum + cl.score, 0) / completedUnitLessons.length),
          xpEarned: unit.xpReward
        };
      } else {
        userProgress.curriculum.completedUnits.push({
          unit: lesson.unit,
          completedAt: new Date(),
          score: Math.round(completedUnitLessons.reduce((sum, cl) => sum + cl.score, 0) / completedUnitLessons.length),
          xpEarned: unit.xpReward
        });
      }

      userProgress.overall.totalXP += unit.xpReward;
      unitCompleted = true;
    }

    await userProgress.save();

    // Update User model learning stats
    await User.findByIdAndUpdate(userId, {
      $set: {
        'learningStats.totalXP': userProgress.overall.totalXP,
        'learningStats.level': userProgress.overall.level,
        'learningStats.lastActiveDate': userProgress.overall.lastActiveDate
      }
    });

    res.status(200).json({
      success: true,
      data: {
        lessonCompleted: true,
        score,
        xpEarned,
        leveledUp,
        newLevel: userProgress.overall.level,
        unitCompleted,
        totalXP: userProgress.overall.totalXP
      }
    });
  } catch (error) {
    logger.errorWithStack('Complete lesson error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all lessons (for admin)
export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ isActive: true })
      .populate('unit', 'title level')
      .populate('signs', 'word category')
      .sort({ 'unit.order': 1, order: 1 });

    res.status(200).json({
      success: true,
      data: lessons
    });
  } catch (error) {
    logger.errorWithStack('Get lessons error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create new unit
// @route   POST /api/curriculum/units
// @access  Private (Admin)
export const createUnit = async (req, res) => {
  try {
    const { title, description, level, order, learningPathId } = req.body;

    const unit = await Unit.create({
      title,
      description,
      level,
      order,
      learningPath: learningPathId,
      createdBy: req.user.id,
      isActive: true
    });

    // Link to LearningPath if provided
    if (learningPathId) {
      await LearningPath.findByIdAndUpdate(learningPathId, {
        $push: { units: unit._id },
        $inc: { totalUnits: 1 }
      });
    }

    res.status(201).json({
      success: true,
      data: unit
    });
  } catch (error) {
    logger.errorWithStack('Create unit error:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new lesson
// @route   POST /api/curriculum/lessons
// @access  Private (Admin)
export const createLesson = async (req, res) => {
  try {
    const { title, unitId, order, level, signs } = req.body;

    const lesson = await Lesson.create({
      title,
      unit: unitId,
      order,
      level,
      signs: signs || [], // Array of Sign IDs
      flashcards: req.body.flashcards || [], // Embedded content
      quizQuestions: req.body.quizQuestions || [], // Embedded content
      createdBy: req.user.id,
      calculateXP: 50, // Default base XP
      isActive: true
    });

    // Link to Unit
    await Unit.findByIdAndUpdate(unitId, {
      $push: { lessons: lesson._id },
      $inc: { totalLessons: 1 }
    });

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.errorWithStack('Create lesson error:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update unit
// @route   PUT /api/curriculum/units/:unitId
export const updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.params.unitId, req.body, {
      new: true,
      runValidators: true
    });

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    res.status(200).json({ success: true, data: unit });
  } catch (error) {
    logger.errorWithStack('Update unit error:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete unit
// @route   DELETE /api/curriculum/units/:unitId
export const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    // Optional: Remove unit from LearningPath 
    if (unit.learningPath) {
        await LearningPath.findByIdAndUpdate(unit.learningPath, {
            $pull: { units: unit._id },
            $inc: { totalUnits: -1 }
        });
    }

    await unit.deleteOne(); // Trigger pre-remove hooks if any
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.errorWithStack('Delete unit error:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lesson
// @route   PUT /api/curriculum/lessons/:lessonId
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, {
      new: true,
      runValidators: true
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    logger.errorWithStack('Update lesson error:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/curriculum/lessons/:lessonId
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Remove lesson from Unit
    if (lesson.unit) {
        await Unit.findByIdAndUpdate(lesson.unit, {
            $pull: { lessons: lesson._id },
            $inc: { totalLessons: -1 }
        });
    }

    await lesson.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.errorWithStack('Delete lesson error:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper functions
const checkUnitUnlock = (unit, userProgress) => {
  if (!userProgress) return unit.order === 1;

  // Check prerequisites
  const completedUnitIds = userProgress.curriculum.completedUnits.map(cu => cu.unit.toString());
  const hasPrerequisites = unit.prerequisites.every(prereq =>
    completedUnitIds.includes(prereq.toString())
  );

  // Check level and XP requirements
  const meetsLevel = userProgress.overall.level >= unit.unlockRequirements.minLevel;
  const meetsXP = userProgress.overall.totalXP >= unit.unlockRequirements.minXP;

  return hasPrerequisites && meetsLevel && meetsXP;
};

const checkLessonUnlock = (lesson, userProgress) => {
  if (!userProgress) return lesson.order === 1;

  // Check prerequisites
  const completedLessonIds = userProgress.curriculum.completedLessons.map(cl => cl.lesson.toString());
  const hasPrerequisites = lesson.prerequisites.every(prereq =>
    completedLessonIds.includes(prereq.toString())
  );

  return hasPrerequisites;
};