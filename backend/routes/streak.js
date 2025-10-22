import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  updateUserStreak, 
  getUserStreakInfo, 
  resetUserStreak 
} from '../controllers/streakController.js';
import logger from '../utils/prettyLogger.js';

const router = express.Router();

/**
 * @route   GET /api/streak/info
 * @desc    Get user streak information
 * @access  Private
 */
router.get('/info', protect, async (req, res) => {
  try {
    const streakInfo = await getUserStreakInfo(req.user.id);
    res.json(streakInfo);
  } catch (error) {
    logger.errorWithStack('Get streak info error', error, 'STREAK');
    res.status(500).json({
      success: false,
      message: 'Failed to get streak information'
    });
  }
});

/**
 * @route   POST /api/streak/update
 * @desc    Update user streak after activity completion
 * @access  Private
 */
router.post('/update', protect, async (req, res) => {
  try {
    const { activityType, xpEarned } = req.body;
    
    if (!activityType) {
      return res.status(400).json({
        success: false,
        message: 'Activity type is required'
      });
    }

    const validActivityTypes = ['quiz', 'skill', 'practice', 'lesson'];
    if (!validActivityTypes.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity type'
      });
    }

    const result = await updateUserStreak(req.user.id, activityType, xpEarned || 0);
    res.json(result);
  } catch (error) {
    logger.errorWithStack('Update streak error', error, 'STREAK');
    res.status(500).json({
      success: false,
      message: 'Failed to update streak'
    });
  }
});

/**
 * @route   POST /api/streak/reset
 * @desc    Reset user streak (admin only)
 * @access  Private (Admin)
 */
router.post('/reset', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await resetUserStreak(userId);
    res.json(result);
  } catch (error) {
    logger.errorWithStack('Reset streak error', error, 'STREAK');
    res.status(500).json({
      success: false,
      message: 'Failed to reset streak'
    });
  }
});

export default router;