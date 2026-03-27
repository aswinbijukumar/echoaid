import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../constants/api';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowDownIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  PrinterIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

export default function AdminSubscriptionManagement() {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    plan: 'all',
    status: 'all',
    search: '',
    dateRange: 'all',
    paymentMethod: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Transparent theme variables with light white lines
  const bg = darkMode ? 'bg-black/20 backdrop-blur-md' : 'bg-white/20 backdrop-blur-md';
  const cardBg = darkMode ? 'bg-black/30 backdrop-blur-lg' : 'bg-white/30 backdrop-blur-lg';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const border = darkMode ? 'border-white/20' : 'border-gray-200/50';
  const borderAccent = darkMode ? 'border-white/30' : 'border-gray-300/70';
  const hoverBg = darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50/50';

  const fetchSubscriptions = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.plan !== 'all' && { plan: filters.plan }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`Failed to fetch subscriptions: ${response.status}`);
        }
      }

      const data = await response.json();
      setSubscriptions(data.data || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, token]);

  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`Failed to fetch subscription stats: ${response.status}`);
        }
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching subscription stats:', err);
      setError(err.message);
    }
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`Failed to fetch subscription analytics: ${response.status}`);
        }
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      console.error('Error fetching subscription analytics:', err);
      setError(err.message);
    }
  }, [token]);


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/${userId}/status`, {
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

  const handleExportData = async (type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(err.message);
    }
  };

  const handleGenerateReport = async (reportType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/subscriptions/reports/${reportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating report:', err);
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

  // Real-time data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchSubscriptions(),
        fetchStats(),
        fetchAnalytics()
      ]);
    };

    fetchAllData();

    // Set up auto-refresh if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAllData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPage, filters, autoRefresh, refreshInterval, fetchSubscriptions, fetchStats, fetchAnalytics]);

  if (loading && !subscriptions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-red-500/20' : 'bg-red-100/50'}`}>
            <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className={`text-lg font-semibold ${text}`}>Error Loading Subscription Data</h3>
        </div>
        <p className={`${textSecondary} mb-4`}>{error}</p>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setError(null);
              fetchSubscriptions();
              fetchStats();
            }}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-2`}
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Retry</span>
          </button>
          <button
            onClick={() => setError(null)}
            className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl ${text} ${hoverBg} transition-all duration-200`}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className={`${cardBg} rounded-2xl border ${borderAccent} p-6 shadow-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${text}`}>Subscription Management</h1>
            <p className={`text-lg ${textSecondary} mt-2`}>Comprehensive subscription and revenue management</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleExportData('all')}
              className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl ${text} ${hoverBg} transition-all duration-200 flex items-center space-x-2`}
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>Export All Data</span>
            </button>
            <button
              onClick={() => handleGenerateReport('revenue')}
              className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg`}
            >
              <PrinterIcon className="h-5 w-5" />
              <span>Generate Revenue Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto-refresh Controls */}
      <div className={`${cardBg} rounded-2xl border ${borderAccent} p-4 shadow-xl mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className={textSecondary}>Auto-refresh</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className={`${bg} ${border} rounded-md px-3 py-1 ${text}`}
              disabled={!autoRefresh}
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </div>
          <button
            onClick={() => {
              fetchSubscriptions();
              fetchStats();
              fetchAnalytics();
            }}
            className={`${bg} ${border} ${text} px-4 py-2 rounded-md hover:${hoverBg} transition-colors flex items-center space-x-2`}
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${cardBg} rounded-2xl border ${borderAccent} p-2 shadow-xl`}>
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartPieIcon },
            { id: 'revenue', label: 'Revenue', icon: BanknotesIcon },
            { id: 'management', label: 'Management', icon: AdjustmentsHorizontalIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? `${darkMode ? 'bg-white/20' : 'bg-gray-100/50'} ${text} border ${borderAccent}`
                  : `${textSecondary} ${hoverBg}`
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Total Subscribers</h3>
                  <p className={`text-3xl font-bold ${text}`}>{stats.totalSubscribers}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">+12% from last month</p>
                </div>

                <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'}`}>
                      <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Monthly Revenue</h3>
                  <p className={`text-3xl font-bold ${text}`}>{formatPrice(stats.monthlyRevenue)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">+8% from last month</p>
                </div>

                <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100/50'}`}>
                      <ChartBarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Active Subscriptions</h3>
                  <p className={`text-3xl font-bold ${text}`}>{stats.activeSubscriptions}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">+15% from last month</p>
                </div>

                <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100/50'}`}>
                      <ClockIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <ArrowDownIcon className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Trial Users</h3>
                  <p className={`text-3xl font-bold ${text}`}>{stats.trialUsers}</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">-5% from last month</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
              <h3 className={`text-xl font-semibold ${text} mb-4`}>Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`p-4 ${cardBg} border ${borderAccent} rounded-xl ${hoverBg} transition-all duration-200 text-left`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                      <ChartPieIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${text}`}>View Analytics</h4>
                      <p className={`text-sm ${textSecondary}`}>Detailed insights and trends</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`p-4 ${cardBg} border ${borderAccent} rounded-xl ${hoverBg} transition-all duration-200 text-left`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'}`}>
                      <BanknotesIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${text}`}>Revenue Reports</h4>
                      <p className={`text-sm ${textSecondary}`}>Financial performance metrics</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('management')}
                  className={`p-4 ${cardBg} border ${borderAccent} rounded-xl ${hoverBg} transition-all duration-200 text-left`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100/50'}`}>
                      <AdjustmentsHorizontalIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${text}`}>Manage Subscriptions</h4>
                      <p className={`text-sm ${textSecondary}`}>User subscription controls</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
              <div>
                <h2 className={`text-2xl font-bold ${text}`}>Subscription Analytics</h2>
                <p className={`text-lg ${textSecondary} mt-2`}>Detailed insights and performance metrics</p>
              </div>
            </div>

            {/* Analytics Charts */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plan Distribution */}
                <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                  <h4 className={`text-xl font-semibold ${text} mb-6`}>Plan Distribution</h4>
                  {analytics.planDistribution && (
                    <div className="h-80">
                      <Pie
                        data={{
                          labels: analytics.planDistribution.map(item => {
                            const planNames = {
                              'free': 'Free Plan',
                              'pro': 'Pro Plan',
                              'premium': 'Premium Plan',
                              'enterprise': 'Enterprise Plan'
                            };
                            return planNames[item._id] || item._id || 'Free Plan';
                          }),
                          datasets: [{
                            data: analytics.planDistribution.map(item => item.count),
                            backgroundColor: [
                              'rgba(99, 102, 241, 0.8)',   // Indigo
                              'rgba(16, 185, 129, 0.8)',   // Emerald
                              'rgba(245, 158, 11, 0.8)',   // Amber
                              'rgba(239, 68, 68, 0.8)',    // Red
                              'rgba(139, 92, 246, 0.8)',   // Violet
                              'rgba(6, 182, 212, 0.8)'     // Cyan
                            ],
                            borderColor: [
                              'rgba(99, 102, 241, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(245, 158, 11, 1)',
                              'rgba(239, 68, 68, 1)',
                              'rgba(139, 92, 246, 1)',
                              'rgba(6, 182, 212, 1)'
                            ],
                            borderWidth: 3,
                            hoverBorderWidth: 4,
                            hoverOffset: 10
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: darkMode ? '#ffffff' : '#374151',
                                padding: 25,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                  size: 14,
                                  weight: '500'
                                }
                              }
                            },
                            tooltip: {
                              backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                              titleColor: darkMode ? '#ffffff' : '#374151',
                              bodyColor: darkMode ? '#ffffff' : '#374151',
                              borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                              borderWidth: 1,
                              cornerRadius: 12,
                              displayColors: true,
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                                  return `${context.label}: ${context.parsed} users (${percentage}%)`;
                                }
                              }
                            }
                          },
                          animation: {
                            animateRotate: true,
                            animateScale: true,
                            duration: 2000
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Distribution */}
                <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                  <h4 className={`text-xl font-semibold ${text} mb-6`}>Status Distribution</h4>
                  {analytics.statusDistribution && (
                    <div className="h-80">
                      <Bar
                        data={{
                          labels: analytics.statusDistribution.map(item => {
                            const statusNames = {
                              'active': 'Active',
                              'trial': 'Trial',
                              'expired': 'Expired',
                              'cancelled': 'Cancelled'
                            };
                            return statusNames[item._id] || item._id;
                          }),
                          datasets: [{
                            label: 'Users',
                            data: analytics.statusDistribution.map(item => item.count),
                            backgroundColor: [
                              'rgba(16, 185, 129, 0.8)',   // Active - Emerald
                              'rgba(59, 130, 246, 0.8)',   // Trial - Blue
                              'rgba(239, 68, 68, 0.8)',    // Expired - Red
                              'rgba(107, 114, 128, 0.8)',  // Cancelled - Gray
                              'rgba(245, 158, 11, 0.8)',   // Other - Amber
                              'rgba(139, 92, 246, 0.8)'    // Other - Violet
                            ],
                            borderColor: [
                              'rgba(16, 185, 129, 1)',
                              'rgba(59, 130, 246, 1)',
                              'rgba(239, 68, 68, 1)',
                              'rgba(107, 114, 128, 1)',
                              'rgba(245, 158, 11, 1)',
                              'rgba(139, 92, 246, 1)'
                            ],
                            borderWidth: 2,
                            borderRadius: 12,
                            borderSkipped: false,
                            hoverBorderWidth: 3,
                            hoverBorderRadius: 15
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                              titleColor: darkMode ? '#ffffff' : '#374151',
                              bodyColor: darkMode ? '#ffffff' : '#374151',
                              borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                              borderWidth: 1,
                              cornerRadius: 12,
                              displayColors: true,
                              callbacks: {
                                label: function(context) {
                                  return `${context.label}: ${context.parsed.y} users`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                drawBorder: false
                              },
                              ticks: {
                                color: darkMode ? '#ffffff' : '#374151',
                                font: {
                                  size: 12,
                                  weight: '500'
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              },
                              ticks: {
                                color: darkMode ? '#ffffff' : '#374151',
                                font: {
                                  size: 12,
                                  weight: '500'
                                }
                              }
                            }
                          },
                          animation: {
                            duration: 2000,
                            easing: 'easeInOutQuart'
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Monthly Trend */}
                <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl lg:col-span-2`}>
                  <h4 className={`text-xl font-semibold ${text} mb-6`}>Monthly Subscription Trend</h4>
                  {analytics.monthlyTrend && (
                    <div className="h-80">
                      <Line
                        data={{
                          labels: analytics.monthlyTrend.map(item => {
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return `${monthNames[item._id.month - 1]} ${item._id.year}`;
                          }),
                          datasets: [{
                            label: 'New Subscriptions',
                            data: analytics.monthlyTrend.map(item => item.count),
                            borderColor: 'rgba(99, 102, 241, 1)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                            pointBorderColor: darkMode ? '#1F2937' : '#ffffff',
                            pointBorderWidth: 3,
                            pointRadius: 8,
                            pointHoverRadius: 10,
                            pointHoverBackgroundColor: 'rgba(99, 102, 241, 1)',
                            pointHoverBorderColor: darkMode ? '#1F2937' : '#ffffff',
                            pointHoverBorderWidth: 4,
                            borderWidth: 4,
                            hoverBorderWidth: 5
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                              titleColor: darkMode ? '#ffffff' : '#374151',
                              bodyColor: darkMode ? '#ffffff' : '#374151',
                              borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                              borderWidth: 1,
                              cornerRadius: 12,
                              displayColors: true,
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y} subscriptions`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                drawBorder: false
                              },
                              ticks: {
                                color: darkMode ? '#ffffff' : '#374151',
                                font: {
                                  size: 12,
                                  weight: '500'
                                }
                              }
                            },
                            x: {
                              grid: {
                                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                drawBorder: false
                              },
                              ticks: {
                                color: darkMode ? '#ffffff' : '#374151',
                                font: {
                                  size: 12,
                                  weight: '500'
                                }
                              }
                            }
                          },
                          animation: {
                            duration: 2000,
                            easing: 'easeInOutQuart'
                          },
                          interaction: {
                            intersect: false,
                            mode: 'index'
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Key Metrics */}
                {analytics.metrics && (
                  <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl lg:col-span-2`}>
                    <h4 className={`text-xl font-semibold ${text} mb-6`}>Key Performance Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`text-center p-6 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'} rounded-2xl border ${borderAccent}`}>
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                          <span className={`text-sm font-medium ${text}`}>Conversion Rate</span>
                        </div>
                        <p className={`text-3xl font-bold text-blue-600`}>
                          {analytics.metrics.conversionRate}%
                        </p>
                        <p className={`text-sm ${textSecondary} mt-2`}>
                          Trial to Paid
                        </p>
                      </div>

                      <div className={`text-center p-6 ${darkMode ? 'bg-red-500/20' : 'bg-red-100/50'} rounded-2xl border ${borderAccent}`}>
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <ArrowDownIcon className="h-6 w-6 text-red-600" />
                          <span className={`text-sm font-medium ${text}`}>Churn Rate</span>
                        </div>
                        <p className={`text-3xl font-bold text-red-600`}>
                          {analytics.metrics.churnRate}%
                        </p>
                        <p className={`text-sm ${textSecondary} mt-2`}>
                          Last 30 days
                        </p>
                      </div>

                      <div className={`text-center p-6 ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'} rounded-2xl border ${borderAccent}`}>
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                          <span className={`text-sm font-medium ${text}`}>ARPU</span>
                        </div>
                        <p className={`text-3xl font-bold text-green-600`}>
                          ₹{analytics.metrics.arpu.toLocaleString()}
                        </p>
                        <p className={`text-sm ${textSecondary} mt-2`}>
                          Average Revenue Per User
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}



        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Header */}
            <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${text}`}>Revenue Analytics</h2>
                  <p className={`text-lg ${textSecondary} mt-2`}>Financial performance and revenue insights</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleExportData('revenue')}
                    className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl ${text} ${hoverBg} transition-all duration-200 flex items-center space-x-2`}
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>Export Revenue Data</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'}`}>
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                </div>
                <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Total Revenue</h3>
                <p className={`text-3xl font-bold ${text}`}>₹{stats?.monthlyRevenue?.toLocaleString() || '0'}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">This month</p>
              </div>

              <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                    <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                </div>
                <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>MRR Growth</h3>
                <p className={`text-3xl font-bold ${text}`}>+{analytics?.metrics?.mrrGrowth || '0'}%</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">vs last month</p>
              </div>

              <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100/50'}`}>
                    <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                </div>
                <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>ARPU</h3>
                <p className={`text-3xl font-bold ${text}`}>₹{analytics?.metrics?.arpu?.toLocaleString() || '0'}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">Average per user</p>
              </div>

              <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100/50'}`}>
                    <UserGroupIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                </div>
                <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>New Customers</h3>
                <p className={`text-3xl font-bold ${text}`}>+{analytics?.metrics?.newCustomers || '0'}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">This month</p>
              </div>
            </div>

            {/* Revenue Trend Chart */}
            {analytics?.monthlyTrend && (
              <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                <h4 className={`text-xl font-semibold ${text} mb-6`}>Revenue Trend (Last 12 Months)</h4>
                <div className="h-80">
                  <Line
                    data={{
                      labels: analytics.monthlyTrend.map(item => `${item.year}-${String(item.month).padStart(2, '0')}`),
                      datasets: [
                        {
                          label: 'Revenue (₹)',
                          data: analytics.monthlyTrend.map(item => item.revenue),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: darkMode ? '#ffffff' : '#374151'
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: darkMode ? '#ffffff' : '#374151'
                          },
                          grid: {
                            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        },
                        y: {
                          ticks: {
                            color: darkMode ? '#ffffff' : '#374151',
                            callback: function(value) {
                              return '₹' + value.toLocaleString();
                            }
                          },
                          grid: {
                            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Revenue by Plan */}
            {analytics?.planAnalytics && (
              <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
                <h4 className={`text-xl font-semibold ${text} mb-6`}>Revenue by Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {analytics.planAnalytics.map((plan, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${borderAccent} ${darkMode ? 'bg-black/20' : 'bg-white/50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className={`font-semibold ${text} capitalize`}>{plan._id || 'Free'}</h5>
                        <span className={`text-sm ${textSecondary}`}>{plan.count} users</span>
                      </div>
                      <p className={`text-2xl font-bold text-green-600`}>₹{plan.revenue?.toLocaleString() || '0'}</p>
                      <p className={`text-sm ${textSecondary}`}>Revenue</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'management' && (
          <div className="space-y-6">
            {/* Management Header */}
            <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
              <div>
                <h2 className={`text-2xl font-bold ${text}`}>Subscription Management</h2>
                <p className={`text-lg ${textSecondary} mt-2`}>Manage user subscriptions and billing</p>
              </div>
            </div>

            {/* Filters */}
            <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${text} placeholder-gray-400`}
                  />
                </div>

                <select
                  value={filters.plan}
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                  className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${text}`}
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
                  className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${text}`}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className={`${cardBg} rounded-2xl border ${borderAccent} shadow-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? 'divide-white/20' : 'divide-gray-200'}`}>
                  <thead className={darkMode ? 'bg-black/20' : 'bg-gray-50/50'}>
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
                  <tbody className="bg-transparent divide-y divide-white/20">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription._id} className={`${hoverBg} transition-colors`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {subscription.avatar ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={subscription.avatar}
                                  alt={subscription.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {subscription.name?.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${text}`}>
                                {subscription.name}
                              </div>
                              <div className={`text-sm ${textSecondary}`}>
                                {subscription.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getPlanColor(subscription.subscription?.plan || 'free')}`}>
                            {(subscription.subscription?.plan || 'free').charAt(0).toUpperCase() + (subscription.subscription?.plan || 'free').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.subscription?.status || 'trial')}`}>
                            {(subscription.subscription?.status || 'trial').charAt(0).toUpperCase() + (subscription.subscription?.status || 'trial').slice(1)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${text}`}>
                          {(subscription.subscription?.billingCycle || 'monthly') === 'yearly' ? 'Yearly' : 'Monthly'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${text}`}>
                          {subscription.subscription?.subscriptionEndDate ? formatDate(subscription.subscription.subscriptionEndDate) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(subscription._id, 'active')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                              title="Activate"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(subscription._id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
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
                <div className="text-center py-12">
                  <p className={`text-lg ${textSecondary}`}>No subscriptions found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {subscriptions.length > 0 && (
              <div className={`${cardBg} p-4 rounded-2xl border ${borderAccent} shadow-xl`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${textSecondary}`}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, subscriptions.length)} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed ${text} ${hoverBg} transition-all duration-200`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={subscriptions.length < itemsPerPage}
                      className={`px-4 py-2 ${cardBg} border ${borderAccent} rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed ${text} ${hoverBg} transition-all duration-200`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}