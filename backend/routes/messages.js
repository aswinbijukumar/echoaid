import express from 'express';
import { protect, adminAndSuperAdmin } from '../middleware/roleAuth.js';
import {
  getMessages,
  getMessageById,
  createMessage,
  replyToMessage,
  updateMessageStatus,
  markAsRead,
  getUserMessages,
  getMessageStats
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/', adminAndSuperAdmin, getMessages);
router.get('/stats', adminAndSuperAdmin, getMessageStats);
router.get('/:id', adminAndSuperAdmin, getMessageById);
router.put('/:id/reply', adminAndSuperAdmin, replyToMessage);
router.put('/:id/status', adminAndSuperAdmin, updateMessageStatus);
router.put('/:id/read', adminAndSuperAdmin, markAsRead);

// User routes
router.post('/', createMessage);
router.get('/user/messages', getUserMessages);
router.put('/user/:id/read', markAsRead);

export default router;