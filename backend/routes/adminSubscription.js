import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getSubscriptions,
  getSubscriptionStats,
  updateSubscriptionStatus,
  getSubscriptionAnalytics,
  getRevenueData,
  getPaymentHistory,
  exportSubscriptionData,
  generateRevenueReport
} from '../controllers/adminSubscriptionController.js';

const router = express.Router();

// All routes require authentication and admin/super_admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Get all subscriptions with filtering and pagination
router.get('/', getSubscriptions);

// Get subscription statistics
router.get('/stats', getSubscriptionStats);

// Get subscription analytics
router.get('/analytics', getSubscriptionAnalytics);

// Get revenue data and analytics
router.get('/revenue', getRevenueData);

// Get payment history
router.get('/payments', getPaymentHistory);

// Export subscription data
router.get('/export/:type', exportSubscriptionData);

// Generate revenue report
router.post('/reports/:reportType', generateRevenueReport);

// Update subscription status
router.patch('/:userId/status', updateSubscriptionStatus);

export default router;