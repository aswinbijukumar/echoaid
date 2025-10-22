import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import { generateInvoicePDF, generateReceiptPDF } from '../utils/pdfGenerator.js';

// Get all subscriptions with filtering and pagination
export const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, plan, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object - exclude admin and admin users
    const filter = {
      role: { $nin: ['admin', 'admin'] } // Only show regular users
    };
    
    if (plan && plan !== 'all') {
      filter['subscription.plan'] = plan;
    }
    
    if (status && status !== 'all') {
      filter['subscription.status'] = status;
    }

    if (search) {
      filter.$and = [
        { role: { $nin: ['admin', 'admin'] } },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
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
        $match: {
          role: { $nin: ['admin', 'admin'] } // Only count regular users
        }
      },
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
    // Plan distribution analytics - exclude admin users
    const planAnalytics = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] } // Only regular users
        }
      },
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

    // Status distribution analytics - exclude admin users
    const statusAnalytics = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] } // Only regular users
        }
      },
      {
        $group: {
          _id: '$subscription.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly subscription trend (last 12 months) - exclude admin users
    const monthlyTrend = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] }, // Only regular users
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

    // Churn rate calculation (last 30 days) - exclude admin users
    const churnAnalytics = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] }, // Only regular users
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

    // Conversion rate from trial to paid - exclude admin users
    const conversionAnalytics = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] }, // Only regular users
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

    // Average revenue per user (ARPU) - exclude admin users
    const arpuAnalytics = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] }, // Only regular users
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

    // Calculate metrics - exclude admin users
    const totalUsers = await User.countDocuments({ role: { $nin: ['admin', 'admin'] } });
    const churnedUsers = churnAnalytics[0]?.churnedUsers || 0;
    const convertedUsers = conversionAnalytics[0]?.convertedUsers || 0;
    const totalRevenue = arpuAnalytics[0]?.totalRevenue || 0;
    const activePaidUsers = arpuAnalytics[0]?.userCount || 0;

    // Calculate additional metrics
    const conversionRate = totalUsers > 0 ? ((convertedUsers / totalUsers) * 100).toFixed(1) : 0;
    const churnRate = totalUsers > 0 ? ((churnedUsers / totalUsers) * 100).toFixed(1) : 0;
    const arpu = activePaidUsers > 0 ? (totalRevenue / activePaidUsers).toFixed(0) : 0;

    // Calculate MRR growth (simplified - compare current month with previous month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthRevenue = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] },
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' },
          'subscription.subscriptionStartDate': {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
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
      }
    ]);

    const lastMonthRevenue = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] },
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' },
          'subscription.subscriptionStartDate': {
            $gte: new Date(lastMonthYear, lastMonth, 1),
            $lt: new Date(lastMonthYear, lastMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
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
      }
    ]);

    const currentRevenue = currentMonthRevenue[0]?.revenue || 0;
    const previousRevenue = lastMonthRevenue[0]?.revenue || 0;
    const mrrGrowth = previousRevenue > 0 ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : 0;

    // Count new customers this month
    const newCustomers = await User.countDocuments({
      role: { $nin: ['admin', 'admin'] },
      'subscription.subscriptionStartDate': {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });


    res.status(200).json({
      success: true,
      data: {
        planDistribution: planAnalytics,
        statusDistribution: statusAnalytics,
        monthlyTrend: monthlyTrend,
        metrics: {
          churnRate: parseFloat(churnRate),
          conversionRate: parseFloat(conversionRate),
          arpu: parseFloat(arpu),
          totalUsers,
          churnedUsers,
          convertedUsers,
          mrrGrowth: parseFloat(mrrGrowth),
          newCustomers,
          currentRevenue,
          previousRevenue
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

// Get revenue data and analytics
export const getRevenueData = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Calculate date range based on period
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Get revenue analytics - exclude admin users
    const revenueAnalytics = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] }, // Only regular users
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' },
          'subscription.subscriptionStartDate': { $gte: startDate, $lt: endDate }
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
          customerCount: { $sum: 1 },
          averageRevenue: {
            $avg: {
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
      }
    ]);

    // Get revenue by plan
    const revenueByPlan = await User.aggregate([
      {
        $match: {
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' }
        }
      },
      {
        $group: {
          _id: '$subscription.plan',
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
          },
          customerCount: { $sum: 1 }
        }
      }
    ]);

    // Get monthly revenue trend - exclude admin users
    const monthlyTrend = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] }, // Only regular users
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' },
          'subscription.subscriptionStartDate': { $gte: new Date(now.getFullYear() - 1, 0, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$subscription.subscriptionStartDate' },
            month: { $month: '$subscription.subscriptionStartDate' }
          },
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
          },
          customerCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const result = revenueAnalytics[0] || {
      totalRevenue: 0,
      customerCount: 0,
      averageRevenue: 0
    };

    res.status(200).json({
      success: true,
      data: {
        ...result,
        revenueByPlan,
        monthlyTrend,
        period
      }
    });
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, paymentMethod, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Build filter for users with payment information - exclude admin users
    const filter = {
      role: { $nin: ['admin', 'admin'] }, // Only regular users
      'subscription.paymentMethod': { $ne: 'none' }
    };

    if (status) {
      filter['subscription.status'] = status;
    }

    if (paymentMethod) {
      filter['subscription.paymentMethod'] = paymentMethod;
    }

    if (startDate && endDate) {
      filter['subscription.subscriptionStartDate'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await User.find(filter)
      .select('name email subscription createdAt updatedAt')
      .sort({ 'subscription.subscriptionStartDate': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform data to payment format
    const paymentHistory = payments.map(user => ({
      id: user.subscription.razorpayPaymentId || `TXN-${user._id}`,
      userId: user._id,
      user: user.name,
      email: user.email,
      amount: getPlanPrice(user.subscription.plan, user.subscription.billingCycle),
      status: user.subscription.status === 'active' ? 'success' : 'failed',
      paymentMethod: user.subscription.paymentMethod,
      date: user.subscription.subscriptionStartDate || user.createdAt,
      plan: user.subscription.plan,
      billingCycle: user.subscription.billingCycle
    }));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: paymentHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Export subscription data
export const exportSubscriptionData = async (req, res) => {
  try {
    const { type = 'all' } = req.params;
    const { format = 'csv' } = req.query;

    let filter = {
      role: { $nin: ['admin', 'admin'] } // Only regular users
    };
    
    if (type === 'active') {
      filter['subscription.status'] = 'active';
    } else if (type === 'revenue') {
      filter['subscription.status'] = 'active';
      filter['subscription.plan'] = { $ne: 'free' };
    }

    const subscriptions = await User.find(filter)
      .select('name email subscription createdAt updatedAt')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Name,Email,Plan,Status,Billing Cycle,Start Date,End Date,Payment Method,Revenue\n';
      const csvData = subscriptions.map(user => {
        const revenue = getPlanPrice(user.subscription.plan, user.subscription.billingCycle);
        return [
          user.name || '',
          user.email || '',
          user.subscription.plan || 'free',
          user.subscription.status || 'trial',
          user.subscription.billingCycle || 'monthly',
          user.subscription.subscriptionStartDate ? user.subscription.subscriptionStartDate.toISOString().split('T')[0] : '',
          user.subscription.subscriptionEndDate ? user.subscription.subscriptionEndDate.toISOString().split('T')[0] : '',
          user.subscription.paymentMethod || 'none',
          revenue
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvData;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=subscriptions-${type}-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      res.status(200).json({
        success: true,
        data: subscriptions
      });
    }
  } catch (error) {
    console.error('Export subscription data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Generate revenue report
export const generateRevenueReport = async (req, res) => {
  try {
    const { reportType = 'monthly' } = req.params;
    const { filters = {} } = req.body;

    // Get revenue data based on report type
    const revenueData = await getRevenueDataForReport(reportType, filters);
    
    // Generate PDF report
    const reportData = {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Revenue Report`,
      generatedAt: new Date(),
      period: reportType,
      ...revenueData
    };

    const pdfBuffer = await generateRevenueReportPDF(reportData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to get plan price
const getPlanPrice = (plan, billingCycle) => {
  const prices = {
    free: 0,
    pro: { monthly: 299, yearly: 2999 },
    premium: { monthly: 599, yearly: 5999 },
    enterprise: { monthly: 999, yearly: 9999 }
  };

  if (plan === 'free') return 0;
  return prices[plan]?.[billingCycle] || prices[plan]?.monthly || 0;
};

// Helper function to get revenue data for reports
const getRevenueDataForReport = async (reportType, filters) => {
  try {
    // Get current month data
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get total revenue
    const revenueStats = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] },
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
          customerCount: { $sum: 1 }
        }
      }
    ]);

    // Get revenue by plan
    const revenueByPlan = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] },
          'subscription.status': 'active',
          'subscription.plan': { $ne: 'free' }
        }
      },
      {
        $group: {
          _id: '$subscription.plan',
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
      }
    ]);

    // Get monthly trend (last 6 months)
    const monthlyTrend = await User.aggregate([
      {
        $match: {
          role: { $nin: ['admin', 'admin'] },
          'subscription.subscriptionStartDate': {
            $gte: new Date(currentYear, currentMonth - 5, 1)
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

    const stats = revenueStats[0] || { totalRevenue: 0, customerCount: 0 };
    const averageRevenue = stats.customerCount > 0 ? stats.totalRevenue / stats.customerCount : 0;

    return {
      totalRevenue: stats.totalRevenue,
      customerCount: stats.customerCount,
      averageRevenue: Math.round(averageRevenue),
      revenueByPlan: revenueByPlan,
      monthlyTrend: monthlyTrend
    };
  } catch (error) {
    console.error('Error getting revenue data for report:', error);
    return {
      totalRevenue: 0,
      customerCount: 0,
      averageRevenue: 0,
      revenueByPlan: [],
      monthlyTrend: []
    };
  }
};

// Helper function to generate revenue report PDF
const generateRevenueReportPDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Set up the document
      doc.fontSize(20).font('Helvetica-Bold').text(data.title, 50, 50);
      
      // Add generation date
      doc.fontSize(10).font('Helvetica').text(`Generated on: ${data.generatedAt.toLocaleDateString()}`, 50, 80);
      
      let yPosition = 120;
      
      // Add summary section
      doc.fontSize(16).font('Helvetica-Bold').text('Revenue Summary', 50, yPosition);
      yPosition += 30;
      
      // Summary data
      doc.fontSize(12).font('Helvetica')
        .text(`Total Revenue: ₹${data.totalRevenue?.toLocaleString() || '0'}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Total Customers: ${data.customerCount || '0'}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Average Revenue per User: ₹${data.averageRevenue?.toLocaleString() || '0'}`, 50, yPosition);
      yPosition += 40;
      
      // Revenue by Plan table
      if (data.revenueByPlan && data.revenueByPlan.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Revenue by Plan', 50, yPosition);
        yPosition += 30;
        
        // Table header
        doc.fontSize(10).font('Helvetica-Bold')
          .text('Plan', 50, yPosition)
          .text('Customers', 200, yPosition)
          .text('Revenue', 300, yPosition);
        
        yPosition += 20;
        
        // Table data
        data.revenueByPlan.forEach(plan => {
          doc.fontSize(10).font('Helvetica')
            .text(plan._id || 'Unknown', 50, yPosition)
            .text((plan.count || 0).toString(), 200, yPosition)
            .text(`₹${(plan.revenue || 0).toLocaleString()}`, 300, yPosition);
          yPosition += 20;
        });
        
        yPosition += 30;
      }
      
      // Monthly Trend table
      if (data.monthlyTrend && data.monthlyTrend.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Monthly Trend (Last 6 Months)', 50, yPosition);
        yPosition += 30;
        
        // Table header
        doc.fontSize(10).font('Helvetica-Bold')
          .text('Month', 50, yPosition)
          .text('New Subscriptions', 200, yPosition)
          .text('Revenue', 350, yPosition);
        
        yPosition += 20;
        
        // Table data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data.monthlyTrend.forEach(trend => {
          const monthName = `${monthNames[trend._id.month - 1]} ${trend._id.year}`;
          doc.fontSize(10).font('Helvetica')
            .text(monthName, 50, yPosition)
            .text((trend.count || 0).toString(), 200, yPosition)
            .text(`₹${(trend.revenue || 0).toLocaleString()}`, 350, yPosition);
          yPosition += 20;
        });
      }
      
      // Add footer
      doc.fontSize(8).font('Helvetica')
        .text('EchoAid Subscription Report', 50, doc.page.height - 50)
        .text(`Generated on ${data.generatedAt.toLocaleDateString()}`, doc.page.width - 200, doc.page.height - 50);
      
      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};