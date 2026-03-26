import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../constants/api';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function SubscriptionLimits() {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${cardBg} rounded-lg p-4 border ${border}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscriptionStatus) {
    return null;
  }

  const { subscription, trialDaysLeft, todayUsage, isTrialExpired, needsUpgrade, isAdmin } = subscriptionStatus;

  // Don't show limits for admin users or paid users
  if (isAdmin || subscription.status !== 'trial') {
    return null;
  }

  const quizProgress = todayUsage ? (todayUsage.quizAttempts / todayUsage.maxQuizAttempts) * 100 : 0;
  const moduleProgress = todayUsage ? (todayUsage.moduleCompletions / todayUsage.maxModuleCompletions) * 100 : 0;

  return (
    <div className={`${cardBg} rounded-lg p-4 border ${border} mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${text}`}>Daily Usage Limits</h3>
        {needsUpgrade && (
          <div className="flex items-center text-orange-500">
            <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Upgrade Soon!</span>
          </div>
        )}
      </div>

      {/* Trial Days Left */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${text} opacity-70`}>Trial Days Remaining</span>
          <span className={`text-sm font-medium ${trialDaysLeft <= 3 ? 'text-orange-500' : 'text-green-500'}`}>
            {trialDaysLeft} days
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${trialDaysLeft <= 3 ? 'bg-orange-500' : 'bg-green-500'}`}
            style={{ width: `${Math.max(0, (trialDaysLeft / 14) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Quiz Attempts */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${text} opacity-70`}>Quiz Attempts Today</span>
          <span className={`text-sm font-medium ${quizProgress >= 100 ? 'text-red-500' : 'text-blue-500'}`}>
            {todayUsage?.quizAttempts || 0} / {todayUsage?.maxQuizAttempts || 5}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${quizProgress >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, quizProgress)}%` }}
          ></div>
        </div>
        {quizProgress >= 100 && (
          <p className="text-red-500 text-xs mt-1">Daily quiz limit reached. Upgrade for unlimited quizzes.</p>
        )}
      </div>

      {/* Learning Modules */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${text} opacity-70`}>Learning Modules Today</span>
          <span className={`text-sm font-medium ${moduleProgress >= 100 ? 'text-red-500' : 'text-green-500'}`}>
            {todayUsage?.moduleCompletions || 0} / {todayUsage?.maxModuleCompletions || 3}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${moduleProgress >= 100 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, moduleProgress)}%` }}
          ></div>
        </div>
        {moduleProgress >= 100 && (
          <p className="text-red-500 text-xs mt-1">Daily module limit reached. Upgrade for unlimited learning.</p>
        )}
      </div>

      {/* Upgrade Prompt */}
      {(needsUpgrade || isTrialExpired) && (
        <div className={`p-3 rounded-lg ${isTrialExpired ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center">
            <ExclamationTriangleIcon className={`w-5 h-5 mr-2 ${isTrialExpired ? 'text-red-500' : 'text-orange-500'}`} />
            <div>
              <p className={`text-sm font-medium ${isTrialExpired ? 'text-red-800' : 'text-orange-800'}`}>
                {isTrialExpired ? 'Trial Expired' : 'Trial Ending Soon'}
              </p>
              <p className={`text-xs ${isTrialExpired ? 'text-red-600' : 'text-orange-600'}`}>
                {isTrialExpired 
                  ? 'Your trial has expired. Upgrade to continue learning.'
                  : 'Your trial ends in 3 days. Upgrade now to continue learning.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
