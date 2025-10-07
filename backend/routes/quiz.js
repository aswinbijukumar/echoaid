import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getQuizzes,
  getQuiz,
  startQuiz,
  submitQuiz,
  getUserAttempts,
  getUserProgress
} from '../controllers/quizController.js';

const router = express.Router();

// Public routes
router.get('/', getQuizzes);
router.get('/:id', getQuiz);

// Protected routes
router.use(protect);

router.post('/start', startQuiz);
router.post('/submit', submitQuiz);
router.get('/user/attempts', getUserAttempts);
router.get('/user/progress', getUserProgress);

export default router;