import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getLearningPaths,
  getLearningPath,
  enrollInLearningPath,
  getCurrentLesson,
  completeExercise
} from '../controllers/learningPathController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all learning paths
router.get('/', getLearningPaths);

// Get single learning path with progress
router.get('/:id', getLearningPath);

// Enroll in a learning path
router.post('/:id/enroll', enrollInLearningPath);

// Get current lesson for user
router.get('/:pathId/current-lesson', getCurrentLesson);

// Complete an exercise
router.post('/exercises/:exerciseId/complete', completeExercise);

export default router;