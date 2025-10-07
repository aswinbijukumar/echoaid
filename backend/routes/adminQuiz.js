import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
  getQuizAnalytics,
  getQuizDashboard,
  getQuestionBank,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '../controllers/adminQuizController.js';

const router = express.Router();

// All admin quiz routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Quiz Management
router.get('/', getAdminQuizzes);
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);
router.patch('/:id/toggle', toggleQuizStatus);

// Analytics
router.get('/analytics/:id', getQuizAnalytics);
router.get('/dashboard/overview', getQuizDashboard);

// Question Bank Management
router.get('/questions/bank', getQuestionBank);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router;