import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUnits,
  getUnit,
  getLessons,
  getLesson,
  completeLesson
} from '../controllers/curriculumController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Unit routes
router.get('/units', getUnits);
router.get('/units/:unitId', getUnit);

// Lesson routes
router.get('/lessons', getLessons);
router.get('/lessons/:lessonId', getLesson);
router.post('/lessons/:lessonId/complete', completeLesson);

export default router;