import express from 'express';
import { protect } from '../middleware/roleAuth.js';
import { aiCoach, aiCoachLimiter } from '../controllers/aiCoachController.js';

const router = express.Router();

// AI Coach endpoint (protected, rate-limited)
router.post('/coach', protect, aiCoachLimiter, aiCoach);

// Public fallback (rate-limited) - allows chatbot to work without login if desired
router.post('/coach/public', aiCoachLimiter, aiCoach);

export default router;

