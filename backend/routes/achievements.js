import express from 'express';
import { protect } from '../middleware/roleAuth.js';
import { 
  getUserAchievements, 
  getAchievementDetails, 
  checkAchievements,
  getAchievementCategories 
} from '../controllers/achievementController.js';

const router = express.Router();

// @route   GET /api/achievements
// @desc    Get all achievements for the logged-in user
// @access  Private
router.get('/', protect, getUserAchievements);

// @route   GET /api/achievements/categories
// @desc    Get achievement categories and rarities
// @access  Private
router.get('/categories', protect, getAchievementCategories);

// @route   GET /api/achievements/:id
// @desc    Get specific achievement details
// @access  Private
router.get('/:id', protect, getAchievementDetails);

// @route   POST /api/achievements/check
// @desc    Check and award achievements based on activity
// @access  Private
router.post('/check', protect, checkAchievements);

export default router;