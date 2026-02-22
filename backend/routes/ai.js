import express from 'express';
import { protect } from '../middleware/roleAuth.js';
import { aiCoach, aiCoachLimiter } from '../controllers/aiCoachController.js';
import {
    getConversation,
    clearConversation,
    exportConversation,
    getUserConversations
} from '../controllers/conversationController.js';

const router = express.Router();

// AI Coach endpoint (protected, rate-limited)
router.post('/coach', protect, aiCoachLimiter, aiCoach);

// Public fallback (rate-limited) - allows chatbot to work without login if desired
router.post('/coach/public', aiCoachLimiter, aiCoach);

// Conversation management
router.get('/conversation/:sessionId', protect, getConversation);
router.delete('/conversation/:sessionId', protect, clearConversation);
router.get('/conversation/:sessionId/export', protect, exportConversation);
router.get('/conversations', protect, getUserConversations);

export default router;

