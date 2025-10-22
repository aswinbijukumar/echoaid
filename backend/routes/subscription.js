import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionPlans,
  checkSubscriptionAccess,
  getSubscriptionStatus,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Get user's current subscription
router.get('/', protect, getSubscription);

// Get available subscription plans
router.get('/plans', getSubscriptionPlans);

// Check access to specific features
router.get('/check-access', protect, checkSubscriptionAccess);

// Get subscription status and usage limits
router.get('/status', protect, getSubscriptionStatus);

// Update subscription (for webhooks)
router.post('/update', updateSubscription);

// Cancel subscription
router.post('/cancel', protect, cancelSubscription);

// Razorpay payment endpoints
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyRazorpayPayment);

export default router;