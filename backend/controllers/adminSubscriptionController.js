import User from '../models/User.js';

// Get all subscriptions with filtering and pagination
export const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, plan, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (plan && plan !== 'all') {
      filter['subscription.plan'] = plan;
    }
    
    if (status && status !== 'all') {
      filter['subscription.status'] = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get subscriptions with user details
    const subscriptions = await User.find(filter)
      .select('name email avatar subscription createdAt updatedAt')
      .sort({ 'subscription.subscriptionStartDate': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get subscription statistics
export const getSubscriptionStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalSubscribers: {
            $sum: {
              $cond: [
                { $in: ['$subscription.status', ['active', 'trial']] },
                1,
                0
              ]
            }
          },
          activeSubscriptions: {
            $sum: {
              $cond: [
                { $eq: ['$subscription.status', 'active'] },
                1,
                0
              ]
            }
          },
          trialUsers: {
            $sum: {
              $cond: [
                { $eq: ['$subscription.status', 'trial'] },
                1,
                0
              ]
            }
          },
          monthlyRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$subscription.status', 'active'] },
                    { $eq: ['$subscription.billingCycle', 'monthly'] }
                  ]
                },
                {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$subscription.plan', 'pro'] }, then: 299 },
                      { case: { $eq: ['$subscription.plan', 'premium'] }, then: 599 },
                      { case: { $eq: ['$subscription.plan', 'enterprise'] }, then: 999 }
                    ],
                    default: 0
                  }
                },
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalSubscribers: 0,
      activeSubscriptions: 0,
      trialUsers: 0,
      monthlyRevenue: 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'trial', 'expired', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update subscription status
    user.subscription.status = status;
    
    if (status === 'active') {
      user.subscription.subscriptionStartDate = new Date();
      user.subscription.subscriptionEndDate = new Date(
        Date.now() + (user.subscription.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
      );
    } else if (status === 'cancelled' || status === 'expired') {
      user.subscription.autoRenew = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription status updated successfully',
      data: user.subscription
    });
  } catch (error) {
    console.error('Update subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get subscription analytics
export const getSubscriptionAnalytics = async (req, res) => {
  try {
    // Plan distribution analytics
    const planAnalytics = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [
                { $eq: ['$subscription.status', 'active'] },
                1,
                0
              ]
            }
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$subscription.status', 'active'] },
                {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$subscription.plan', 'pro'] }, then: { $multiply: [299, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } },
                      { case: { $eq: ['$subscription.plan', 'premium'] }, then: { $multiply: [599, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } },
                      { case: { $eq: ['$subscription.plan', 'enterprise'] }, then: { $multiply: [999, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } }
                    ],
                    default: 0
                  }
                },
                0
              ]
            }
          }
        }
      }
    ]);

    // Status distribution analytics
    const statusAnalytics = await User.aggregate([
      {
        $group: {
          _id: '$subscription.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly subscription trend (last 12 months)
    const monthlyTrend = await User.aggregate([
      {
        $match: {
          'subscription.subscriptionStartDate': {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$subscription.subscriptionStartDate' },
            month: { $month: '$subscription.subscriptionStartDate' }
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$subscription.plan', 'pro'] }, then: { $multiply: [299, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } },
                  { case: { $eq: ['$subscription.plan', 'premium'] }, then: { $multiply: [599, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } },
                  { case: { $eq: ['$subscription.plan', 'enterprise'] }, then: { $multiply: [999, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } }
                ],
                default: 0
              }
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Churn rate calculation (last 30 days)
    const churnAnalytics = await User.aggregate([
      {
        $match: {
          'subscription.status': { $in: ['cancelled', 'expired'] },
          updatedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          churnedUsers: { $sum: 1 }
        }
      }
    ]);

    // Conversion rate from trial to paid
    const conversionAnalytics = await User.aggregate([
      {
        $match: {
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' }
        }
      },
      {
        $group: {
          _id: null,
          convertedUsers: { $sum: 1 }
        }
      }
    ]);

    // Average revenue per user (ARPU)
    const arpuAnalytics = await User.aggregate([
      {
        $match: {
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$subscription.plan', 'pro'] }, then: { $multiply: [299, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } },
                  { case: { $eq: ['$subscription.plan', 'premium'] }, then: { $multiply: [599, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } },
                  { case: { $eq: ['$subscription.plan', 'enterprise'] }, then: { $multiply: [999, { $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 12, 1] }] } }
                ],
                default: 0
              }
            }
          },
          userCount: { $sum: 1 }
        }
      }
    ]);

    // Calculate metrics
    const totalUsers = await User.countDocuments();
    const churnedUsers = churnAnalytics[0]?.churnedUsers || 0;
    const convertedUsers = conversionAnalytics[0]?.convertedUsers || 0;
    const totalRevenue = arpuAnalytics[0]?.totalRevenue || 0;
    const activePaidUsers = arpuAnalytics[0]?.userCount || 0;

    const churnRate = totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;
    const conversionRate = totalUsers > 0 ? (convertedUsers / totalUsers) * 100 : 0;
    const arpu = activePaidUsers > 0 ? totalRevenue / activePaidUsers : 0;

    res.status(200).json({
      success: true,
      data: {
        planDistribution: planAnalytics,
        statusDistribution: statusAnalytics,
        monthlyTrend: monthlyTrend,
        metrics: {
          churnRate: Math.round(churnRate * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          arpu: Math.round(arpu),
          totalUsers,
          churnedUsers,
          convertedUsers
        }
      }
    });
  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};