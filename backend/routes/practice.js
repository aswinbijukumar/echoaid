import express from 'express';
import fileUpload from 'express-fileupload';
import { protect, adminAndSuperAdmin } from '../middleware/roleAuth.js';
import { recognize, recentAttempts, addPracticeLater, removePracticeLater, listPracticeLater, updateUserProgress, getUserProgress, scoreLandmarks } from '../controllers/practiceController.js';

const router = express.Router();

// Authenticated user (any logged-in user can practice)
router.use(protect);

// File upload middleware (limit reasonably small for practice images)
router.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: false
}));

router.post('/recognize', recognize);
router.post('/score', scoreLandmarks);
router.get('/attempts/recent', recentAttempts);
router.post('/later', addPracticeLater);
router.get('/later', listPracticeLater);
router.delete('/later/:id', removePracticeLater);
router.post('/progress', updateUserProgress);
router.get('/progress', getUserProgress);

export default router;

