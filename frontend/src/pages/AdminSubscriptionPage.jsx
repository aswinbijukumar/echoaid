import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import AdminSubscriptionManagement from '../components/AdminSubscriptionManagement';
import { 
  ChartBarIcon,
  BanknotesIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

export default function AdminSubscriptionPage() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);

  // Transparent theme variables
  const bg = darkMode ? 'bg-black/20 backdrop-blur-md' : 'bg-white/20 backdrop-blur-md';
  const cardBg = darkMode ? 'bg-black/30 backdrop-blur-lg' : 'bg-white/30 backdrop-blur-lg';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const border = darkMode ? 'border-white/20' : 'border-gray-200/50';
  const borderAccent = darkMode ? 'border-white/30' : 'border-gray-300/70';

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Page Header */}
      <div className={`${cardBg} rounded-2xl border ${borderAccent} p-6 shadow-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${text}`}>Subscription Management</h1>
            <p className={`text-lg ${textSecondary} mt-2`}>
              Comprehensive subscription and revenue management dashboard
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'}`}>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className={`text-sm ${textSecondary}`}>Revenue Growth</p>
              <p className={`text-2xl font-bold text-green-600`}>+12.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
          </div>
          <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Total Subscribers</h3>
          <p className={`text-3xl font-bold ${text}`}>1,247</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">+8% this month</p>
        </div>

        <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'}`}>
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
          </div>
          <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Monthly Revenue</h3>
          <p className={`text-3xl font-bold ${text}`}>₹2,45,680</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">+15% this month</p>
        </div>

        <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100/50'}`}>
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
          </div>
          <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Active Subscriptions</h3>
          <p className={`text-3xl font-bold ${text}`}>892</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">+12% this month</p>
        </div>

        <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl hover:shadow-2xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100/50'}`}>
              <CreditCardIcon className="h-6 w-6 text-orange-600" />
            </div>
            <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
          </div>
          <h3 className={`text-sm font-medium ${textSecondary} mb-1`}>Churn Rate</h3>
          <p className={`text-3xl font-bold ${text}`}>2.3%</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">-0.5% improvement</p>
        </div>
      </div>

      {/* Main Subscription Management Component */}
      <AdminSubscriptionManagement />

      {/* Additional Features Section */}
      <div className={`${cardBg} p-6 rounded-2xl border ${borderAccent} shadow-xl`}>
        <h3 className={`text-xl font-semibold ${text} mb-4`}>Additional Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 ${cardBg} border ${borderAccent} rounded-xl hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className={`font-medium ${text}`}>Automated Reports</h4>
            </div>
            <p className={`text-sm ${textSecondary}`}>
              Schedule and receive automated subscription and revenue reports via email.
            </p>
          </div>

          <div className={`p-4 ${cardBg} border ${borderAccent} rounded-xl hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'}`}>
                <BanknotesIcon className="h-5 w-5 text-green-600" />
              </div>
              <h4 className={`font-medium ${text}`}>Revenue Forecasting</h4>
            </div>
            <p className={`text-sm ${textSecondary}`}>
              AI-powered revenue forecasting based on historical data and trends.
            </p>
          </div>

          <div className={`p-4 ${cardBg} border ${borderAccent} rounded-xl hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100/50'}`}>
                <UserGroupIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className={`font-medium ${text}`}>Customer Insights</h4>
            </div>
            <p className={`text-sm ${textSecondary}`}>
              Deep insights into customer behavior and subscription patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}