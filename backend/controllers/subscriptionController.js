import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';
import UserSkillProgress from '../models/UserSkillProgress.js';
import sendEmail from '../utils/sendEmail.js';
import razorpay from '../config/razorpay.js';
import { generateInvoicePDF, generateReceiptPDF } from '../utils/pdfGenerator.js';
import logger from '../utils/prettyLogger.js';

// Get user subscription details
export const getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('subscription');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.subscription
    });
  } catch (error) {
    logger.errorWithStack('Get subscription error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update subscription status (for Razorpay webhooks)
export const updateSubscription = async (req, res) => {
  try {
    const { userId, plan, status, subscriptionId, customerId, billingCycle } = req.body;
    logger.info('updateSubscription called', { userId, plan, status }, 'CONTROLLER');

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update subscription details
    user.subscription.plan = plan;
    user.subscription.status = status;
    user.subscription.billingCycle = billingCycle || 'monthly';

    if (status === 'active') {
      user.subscription.subscriptionStartDate = new Date();
      user.subscription.subscriptionEndDate = new Date(
        Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
      );
      user.subscription.paymentMethod = 'razorpay';
      user.subscription.razorpaySubscriptionId = subscriptionId;
      user.subscription.razorpayCustomerId = customerId;
      user.subscription.autoRenew = true;
    }

    // Update features based on plan
    updatePlanFeatures(user, plan);

    await user.save();

    // Send confirmation email
    if (status === 'active') {
      try {
        const { getSubscriptionActivatedEmail } = await import('../utils/emailTemplates.js');
        await sendEmail({
          email: user.email,
          subject: 'Subscription Activated - EchoAid',
          html: getSubscriptionActivatedEmail(
            user.name,
            plan.charAt(0).toUpperCase() + plan.slice(1),
            billingCycle,
            user.subscription.subscriptionEndDate.toLocaleDateString()
          )
        });
      } catch (emailError) {
        logger.error('Failed to send activation email', emailError, 'CONTROLLER');
      }
    }

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: user.subscription
    });
  } catch (error) {
    logger.errorWithStack('Update subscription error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update subscription status
    user.subscription.status = 'cancelled';
    user.subscription.autoRenew = false;

    // Reset features to free plan
    updatePlanFeatures(user, 'free');

    await user.save();

    // Send cancellation email
    try {
      const { getSubscriptionCancelledEmail } = await import('../utils/emailTemplates.js');
      // Calculate end date (if available or standard logic)
      const endDate = user.subscription.subscriptionEndDate
        ? new Date(user.subscription.subscriptionEndDate).toLocaleDateString()
        : 'the end of your billing cycle';

      await sendEmail({
        email: user.email,
        subject: 'Subscription Cancelled - EchoAid',
        html: getSubscriptionCancelledEmail(user.name, endDate)
      });
    } catch (emailError) {
      logger.error('Failed to send cancellation email', emailError, 'CONTROLLER');
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    logger.errorWithStack('Cancel subscription error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get subscription plans
export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free Trial',
        price: { monthly: 0, yearly: 0 },
        description: 'Perfect for getting started',
        features: [
          'Basic sign language learning',
          'Limited Quizes (5 per day)',
          'Limited learning modules (3 per day)',
          'Basic progress tracking',
          'Community support',
          'Mobile app access'
        ],
        limitations: [
          'Limited to 5 Quizes per day',
          'Limited to 3 learning modules per day',
          'Basic analytics only',
          'Standard support',
          '14-day trial period'
        ],
        color: 'gray',
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 299, yearly: 2999 },
        description: 'Most popular for serious learners',
        features: [
          'Unlimited Quizes and practice',
          'Advanced progress analytics',
          'Priority customer support',
          'Offline mode access',
          'Advanced gamification',
          'Custom learning paths',
          'Export progress reports'
        ],
        limitations: [],
        color: 'blue',
        popular: true
      },
      {
        id: 'premium',
        name: 'Premium',
        price: { monthly: 599, yearly: 5999 },
        description: 'For educators and institutions',
        features: [
          'Everything in Pro',
          'Classroom management tools',
          'Student progress monitoring',
          'Bulk user management',
          'Advanced reporting dashboard',
          'API access',
          'Custom branding options',
          'Dedicated account manager'
        ],
        limitations: [],
        color: 'purple',
        popular: false
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: { monthly: 999, yearly: 9999 },
        description: 'For large organizations',
        features: [
          'Everything in Premium',
          'White-label solution',
          'Custom integrations',
          'On-premise deployment',
          'Advanced security features',
          'SLA guarantee',
          'Custom training programs',
          '24/7 priority support'
        ],
        limitations: [],
        color: 'gold',
        popular: false
      }
    ];

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    logger.errorWithStack('Get subscription plans error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check subscription access
export const checkSubscriptionAccess = async (req, res) => {
  try {
    const { feature } = req.query;
    const user = await User.findById(req.user.id).select('subscription');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasAccess = checkFeatureAccess(user.subscription, feature);

    res.status(200).json({
      success: true,
      data: {
        hasAccess,
        subscription: user.subscription
      }
    });
  } catch (error) {
    logger.errorWithStack('Check subscription access error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get subscription status and limits
export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('subscription role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Admin users have unlimited access
    if (user.role === 'admin') {
      return res.status(200).json({
        success: true,
        data: {
          subscription: {
            plan: 'admin',
            status: 'active',
            features: {
              unlimitedQuizes: true,
              advancedAnalytics: true,
              prioritySupport: true,
              customProgressTracking: true,
              offlineMode: true,
              advancedGamification: true,
              apiAccess: true,
              whiteLabel: true
            }
          },
          trialDaysLeft: null,
          todayUsage: null,
          isTrialExpired: false,
          needsUpgrade: false,
          isAdmin: true
        }
      });
    }

    const subscription = user.subscription;
    const now = new Date();

    // Calculate trial days left
    let trialDaysLeft = 0;
    if (subscription.status === 'trial' && subscription.trialEndDate) {
      const trialEnd = new Date(subscription.trialEndDate);
      const diffTime = trialEnd - now;
      trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Get today's usage for trial users
    let todayUsage = {};
    if (subscription.status === 'trial') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Count today's quiz attempts
      const quizAttempts = await QuizAttempt.countDocuments({
        userId: req.user.id,
        createdAt: { $gte: today, $lt: tomorrow }
      });

      // Count today's module completions
      const userProgress = await UserSkillProgress.findOne({ user: req.user.id });
      let moduleCompletions = 0;
      if (userProgress && userProgress.skills) {
        moduleCompletions = userProgress.skills.filter(skill =>
          skill.isCompleted &&
          skill.completedAt &&
          new Date(skill.completedAt) >= today &&
          new Date(skill.completedAt) < tomorrow
        ).length;
      }

      todayUsage = {
        quizAttempts,
        moduleCompletions,
        maxQuizAttempts: 5,
        maxModuleCompletions: 3
      };
    }

    res.status(200).json({
      success: true,
      data: {
        subscription,
        trialDaysLeft,
        todayUsage,
        isTrialExpired: subscription.status === 'trial' && trialDaysLeft === 0,
        needsUpgrade: subscription.status === 'trial' && trialDaysLeft <= 3
      }
    });
  } catch (error) {
    logger.errorWithStack('Get subscription status error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to update plan features
const updatePlanFeatures = (user, plan) => {
  const features = {
    free: {
      unlimitedQuizes: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customProgressTracking: false,
      offlineMode: false,
      advancedGamification: false,
      apiAccess: false,
      whiteLabel: false
    },
    pro: {
      unlimitedQuizes: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customProgressTracking: true,
      offlineMode: true,
      advancedGamification: true,
      apiAccess: false,
      whiteLabel: false
    },
    premium: {
      unlimitedQuizes: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customProgressTracking: true,
      offlineMode: true,
      advancedGamification: true,
      apiAccess: true,
      whiteLabel: false
    },
    enterprise: {
      unlimitedQuizes: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customProgressTracking: true,
      offlineMode: true,
      advancedGamification: true,
      apiAccess: true,
      whiteLabel: true
    }
  };

  user.subscription.features = features[plan] || features.free;
};

// Helper function to check feature access
const checkFeatureAccess = (subscription, feature) => {
  if (!subscription || subscription.status === 'expired' || subscription.status === 'cancelled') {
    return false;
  }

  // Trial users have limited access
  if (subscription.status === 'trial') {
    const trialFeatures = ['unlimitedQuizes', 'advancedAnalytics'];
    return trialFeatures.includes(feature);
  }

  // Active subscribers have full access based on their plan
  return subscription.features[feature] || false;
}

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    logger.info('Creating Razorpay order...', null, 'CONTROLLER');
    logger.debug('Request body:', req.body, 'CONTROLLER');
    logger.debug('User:', req.user, 'CONTROLLER');

    const { amount, currency = 'INR', plan, billingCycle } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!amount || !plan || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, plan, or billingCycle'
      });
    }

    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      logger.errorWithStack('Razorpay configuration missing', error, 'CONTROLLER');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error'
      });
    }

    logger.info('Creating order with Razorpay...', null, 'CONTROLLER');
    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `order_${Date.now()}`, // Simplified receipt ID
      notes: {
        userId: userId,
        plan: plan,
        billingCycle: billingCycle
      }
    });

    logger.debug('Order created successfully:', order.id, 'CONTROLLER');

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    logger.errorWithStack('Create Razorpay order error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user.id;

    // Verify payment signature
    const crypto = await import('crypto');

    // Debug logging
    logger.info(`Verifying payment signature: Order=${orderId}, Payment=${paymentId}`, null, 'CONTROLLER');
    logger.debug(`Received Signature: ${signature}`, null, 'CONTROLLER');
    logger.debug(`Received Signature: ${signature}`, null, 'CONTROLLER');
    logger.debug(`Hmac Secret Available: ${!!process.env.RAZORPAY_KEY_SECRET}`, null, 'CONTROLLER');

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const expectedSignature = hmac.digest('hex');

    logger.debug(`Expected Signature: ${expectedSignature}`, null, 'CONTROLLER');

    if (expectedSignature !== signature) {
      logger.error('Signature mismatch!', { expected: expectedSignature, received: signature }, 'CONTROLLER');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get order details from Razorpay
    const order = await razorpay.orders.fetch(orderId);

    // Update user subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Extract plan and billing cycle from order notes
    const { plan, billingCycle } = order.notes;

    // Update subscription
    user.subscription.plan = plan;
    user.subscription.status = 'active';
    user.subscription.billingCycle = billingCycle;
    user.subscription.subscriptionStartDate = new Date();
    user.subscription.subscriptionEndDate = new Date(
      Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
    );
    user.subscription.paymentMethod = 'razorpay';
    user.subscription.razorpayOrderId = orderId;
    user.subscription.razorpayPaymentId = paymentId;
    user.subscription.autoRenew = true;

    // Update features based on plan
    updatePlanFeatures(user, plan);

    await user.save();

    // Generate PDF bills
    const paymentData = {
      orderId: orderId,
      paymentId: paymentId,
      plan: plan,
      billingCycle: billingCycle,
      amount: order.amount
    };

    const userData = {
      name: user.name,
      email: user.email
    };

    // Try to generate PDFs, but don't fail the payment if PDF generation fails
    let attachments = [];
    try {
      const invoicePDF = generateInvoicePDF(paymentData, userData);
      const receiptPDF = generateReceiptPDF(paymentData, userData);

      attachments = [
        {
          filename: invoicePDF.fileName,
          content: invoicePDF.buffer,
          contentType: 'application/pdf'
        },
        {
          filename: receiptPDF.fileName,
          content: receiptPDF.buffer,
          contentType: 'application/pdf'
        }
      ];
    } catch (pdfError) {
      logger.warning('PDF generation failed, continuing without attachments', { error: pdfError.message }, 'EMAIL');
      // Continue without PDF attachments - payment verification should not fail
    }

    // Send confirmation email (with or without PDF attachments)
    try {
      const { getPaymentSuccessEmail } = await import('../utils/emailTemplates.js');
      logger.info('Attempting to send payment success email...', { email: user.email }, 'CONTROLLER');

      const emailHtml = getPaymentSuccessEmail(
        user.name,
        plan.charAt(0).toUpperCase() + plan.slice(1),
        `₹${(order.amount / 100).toLocaleString()}`,
        paymentId,
        new Date().toLocaleDateString()
      );

      await sendEmail({
        email: user.email,
        subject: 'Payment Successful - EchoAid Subscription',
        html: emailHtml,
        attachments: attachments
      });
      logger.success('Payment success email sent!', null, 'CONTROLLER');
    } catch (emailError) {
      logger.error('Failed to send payment confirmation email', emailError, 'CONTROLLER');
      // Don't fail the request
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      data: {
        orderId,
        paymentId,
        plan,
        billingCycle
      }
    });
  } catch (error) {
    logger.errorWithStack('Verify Razorpay payment error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};
