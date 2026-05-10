import User from '../models/User.js';

import logger from '../utils/prettyLogger.js';
// Middleware to check subscription access for specific features
export const checkSubscriptionAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('subscription role');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Skip subscription checks for admin users
      if (user.role === 'admin') {
        req.subscription = { 
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
        };
        return next();
      }

      const subscription = user.subscription;
      
      // Check if subscription is expired or cancelled
      if (!subscription || subscription.status === 'expired' || subscription.status === 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Subscription required. Please upgrade to continue.',
          data: { 
            upgradeRequired: true,
            currentPlan: subscription?.plan || 'none',
            currentStatus: subscription?.status || 'none'
          }
        });
      }

      // Check trial expiration
      if (subscription.status === 'trial') {
        const now = new Date();
        const trialEnd = new Date(subscription.trialEndDate);
        
        if (now > trialEnd) {
          return res.status(403).json({
            success: false,
            message: 'Trial period expired. Please upgrade to continue.',
            data: { 
              upgradeRequired: true,
              trialExpired: true,
              trialEndDate: subscription.trialEndDate
            }
          });
        }
      }

      // Check feature-specific access
      if (feature && subscription.features) {
        const hasFeatureAccess = subscription.features[feature];
        
        if (!hasFeatureAccess) {
          return res.status(403).json({
            success: false,
            message: `This feature requires a ${subscription.plan === 'free' ? 'paid' : 'higher tier'} subscription.`,
            data: { 
              upgradeRequired: true,
              requiredFeature: feature,
              currentPlan: subscription.plan
            }
          });
        }
      }

      // Add subscription info to request for use in controllers
      req.subscription = subscription;
      next();
    } catch (error) {
      logger.errorWithStack('Subscription access check error:', error, error, 'CONTROLLER');
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Middleware to check daily limits for trial users
export const checkDailyLimits = (limitType, maxLimit) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const subscription = req.subscription; // From previous middleware
      
      // Skip limits for admin users
      if (subscription.plan === 'admin') {
        return next();
      }
      
      // Only apply limits to trial users
      if (subscription.status === 'trial') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // This would need to be implemented based on the specific limit type
        // For now, we'll let the controllers handle the specific counting
        req.dailyLimit = {
          type: limitType,
          max: maxLimit,
          period: { start: today, end: tomorrow }
        };
      }
      
      next();
    } catch (error) {
      logger.errorWithStack('Daily limits check error:', error, error, 'CONTROLLER');
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
