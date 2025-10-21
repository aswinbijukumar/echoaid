import express from 'express';
import { protect, adminAndSuperAdmin } from '../middleware/roleAuth.js';
import {
  getMessages,
  getMessageById,
  markAsRead,
  replyToMessage,
  updateMessageStatus,
  getMessageStats,
  createMessage
} from '../controllers/messageController.js';

const router = express.Router();

// Admin routes (protected)
router.get('/', protect, adminAndSuperAdmin, getMessages);
router.get('/stats', protect, adminAndSuperAdmin, getMessageStats);
router.get('/:id', protect, adminAndSuperAdmin, getMessageById);
router.put('/:id/read', protect, adminAndSuperAdmin, markAsRead);
router.put('/:id/reply', protect, adminAndSuperAdmin, replyToMessage);
router.put('/:id/status', protect, adminAndSuperAdmin, updateMessageStatus);

// User routes (for creating messages)
router.post('/', protect, createMessage);

export default router;