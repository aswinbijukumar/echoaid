import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSkills,
  getUserProgress,
  completeSkillLesson
} from '../controllers/skillController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Skill routes
router.get('/', getSkills);
router.get('/progress', getUserProgress);
router.post('/:skillId/complete', completeSkillLesson);

export default router;