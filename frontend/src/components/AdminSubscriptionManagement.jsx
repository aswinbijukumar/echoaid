import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../constants/api';
import { 
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowDownIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AdminSubscriptionManagement() {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    plan: 'all',
    status: 'all',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
    if (showAnalytics) {
      fetchAnalytics();
    }
  }, [currentPage, filters, showAnalytics, fetchSubscriptions, fetchStats, fetchAnalytics]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.plan !== 'all' && { plan: filters.plan }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${API_BASE_URL}/admin/subscriptions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      setSubscriptions(data.data);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, token]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching subscription stats:', err);
    }
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      console.error('Error fetching subscription analytics:', err);
    }
  }, [token]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription status');
      }

      fetchSubscriptions();
      fetchStats();
    } catch (err) {
      console.error('Error updating subscription status:', err);
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      trial: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      expired: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      cancelled: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    };
    return colors[status] || colors.trial;
  };

  const getPlanColor = (plan) => {
    const colors = {
      free: 'text-gray-600',
      pro: 'text-blue-600',
      premium: 'text-purple-600',
      enterprise: 'text-yellow-600'
    };
    return colors[plan] || colors.free;
  };

  if (loading && !subscriptions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${bg} p-4 rounded-lg border ${border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5 text-blue-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Subscribers</span>
              </div>
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{stats.totalSubscribers}</p>
            <p className="text-xs text-green-600 dark:text-green-400">+12% from last month</p>
          </div>

          <div className={`${bg} p-4 rounded-lg border ${border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monthly Revenue</span>
              </div>
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{formatPrice(stats.monthlyRevenue)}</p>
            <p className="text-xs text-green-600 dark:text-green-400">+8% from last month</p>
          </div>

          <div className={`${bg} p-4 rounded-lg border ${border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Subscriptions</span>
              </div>
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{stats.activeSubscriptions}</p>
            <p className="text-xs text-green-600 dark:text-green-400">+15% from last month</p>
          </div>

          <div className={`${bg} p-4 rounded-lg border ${border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-orange-600" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Trial Users</span>
              </div>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{stats.trialUsers}</p>
            <p className="text-xs text-red-600 dark:text-red-400">-5% from last month</p>
          </div>
        </div>
      )}

      {/* Analytics Toggle */}
      <div className={`${bg} p-4 rounded-lg border ${border}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${text}`}>Subscription Analytics</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Detailed insights and trends</p>
          </div>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <div className={`${bg} p-6 rounded-lg border ${border}`}>
            <h4 className={`text-lg font-semibold ${text} mb-4`}>Plan Distribution</h4>
            {analytics.planDistribution && (
              <Pie
                data={{
                  labels: analytics.planDistribution.map(item => item._id || 'Free'),
                  datasets: [{
                    data: analytics.planDistribution.map(item => item.count),
                    backgroundColor: [
                      '#6B7280', // Free - Gray
                      '#3B82F6', // Pro - Blue
                      '#8B5CF6', // Premium - Purple
                      '#F59E0B'  // Enterprise - Yellow
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            )}
          </div>

          {/* Status Distribution */}
          <div className={`${bg} p-6 rounded-lg border ${border}`}>
            <h4 className={`text-lg font-semibold ${text} mb-4`}>Status Distribution</h4>
            {analytics.statusDistribution && (
              <Bar
                data={{
                  labels: analytics.statusDistribution.map(item => item._id),
                  datasets: [{
                    label: 'Users',
                    data: analytics.statusDistribution.map(item => item.count),
                    backgroundColor: [
                      '#10B981', // Active - Green
                      '#3B82F6', // Trial - Blue
                      '#EF4444', // Expired - Red
                      '#6B7280'  // Cancelled - Gray
                    ],
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </div>

          {/* Monthly Trend */}
          <div className={`${bg} p-6 rounded-lg border ${border} lg:col-span-2`}>
            <h4 className={`text-lg font-semibold ${text} mb-4`}>Monthly Subscription Trend</h4>
            {analytics.monthlyTrend && (
              <Line
                data={{
                  labels: analytics.monthlyTrend.map(item => `${item._id.year}/${item._id.month}`),
                  datasets: [{
                    label: 'New Subscriptions',
                    data: analytics.monthlyTrend.map(item => item.count),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </div>

          {/* Key Metrics */}
          {analytics.metrics && (
            <div className={`${bg} p-6 rounded-lg border ${border} lg:col-span-2`}>
              <h4 className={`text-lg font-semibold ${text} mb-4`}>Key Performance Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Conversion Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.metrics.conversionRate}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Trial to Paid
                  </p>
                </div>

                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <ArrowDownIcon className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Churn Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analytics.metrics.churnRate}%
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Last 30 days
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">ARPU</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{analytics.metrics.arpu.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Average Revenue Per User
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className={`${bg} p-4 rounded-lg border ${border}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`px-3 py-2 border ${border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
            />
          </div>

          <select
            value={filters.plan}
            onChange={(e) => handleFilterChange('plan', e.target.value)}
            className={`px-3 py-2 border ${border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
          >
            <option value="all">All Plans</option>
            <option value="free">Free Trial</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`px-3 py-2 border ${border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchSubscriptions}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 inline mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className={`${bg} rounded-lg border ${border} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.map((subscription) => (
                <tr key={subscription._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {subscription.user.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={subscription.user.avatar}
                            alt={subscription.user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {subscription.user.name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPlanColor(subscription.plan)}`}>
                      {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {subscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {subscription.subscriptionEndDate ? formatDate(subscription.subscriptionEndDate) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(subscription.user._id, 'active')}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Activate"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(subscription.user._id, 'cancelled')}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Cancel"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {subscriptions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, subscriptions.length)} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={subscriptions.length < itemsPerPage}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}