import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { 
  StarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  // Theme variables
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  useEffect(() => {
    if (user?.subscription) {
      setSubscription(user.subscription);
      
      // Calculate trial days left
      if (user.subscription.status === 'trial' && user.subscription.trialEndDate) {
        const now = new Date();
        const trialEnd = new Date(user.subscription.trialEndDate);
        const diffTime = trialEnd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(Math.max(0, diffDays));
      }
    } else {
      // Set default subscription for users without subscription data
      setSubscription({
        plan: 'free',
        status: 'trial',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        features: {}
      });
    }
  }, [user]);

  const getPlanInfo = (plan) => {
    const plans = {
      free: { name: 'Free Trial', color: 'gray', icon: StarIcon },
      pro: { name: 'Pro', color: 'blue', icon: StarIcon },
      premium: { name: 'Premium', color: 'purple', icon: SparklesIcon },
      enterprise: { name: 'Enterprise', color: 'gold', icon: SparklesIcon }
    };
    return plans[plan] || plans.free;
  };

  const getStatusColor = (status) => {
    const colors = {
      trial: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      active: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      expired: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      cancelled: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    };
    return colors[status] || colors.trial;
  };

  const getStatusIcon = (status) => {
    const icons = {
      trial: ClockIcon,
      active: CheckCircleIcon,
      expired: ExclamationTriangleIcon,
      cancelled: ExclamationTriangleIcon
    };
    return icons[status] || ClockIcon;
  };

  if (!subscription) return null;

  const planInfo = getPlanInfo(subscription.plan);
  const StatusIcon = getStatusIcon(subscription.status);

  return (
    <div className={`${cardBg} rounded-lg p-4 border ${border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${darkMode ? 'bg-[#1A1A1A]' : 'bg-white'} rounded-lg shadow-sm border ${border}`}>
            <planInfo.icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                {planInfo.name} Plan
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                <StatusIcon className="h-3 w-3 inline mr-1" />
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {subscription.status === 'trial' 
                ? `${trialDaysLeft} days left in your free trial`
                : subscription.status === 'active' && subscription.subscriptionEndDate
                ? `Active until ${new Date(subscription.subscriptionEndDate).toLocaleDateString()}`
                : 'Subscription expired'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {subscription.status === 'trial' && trialDaysLeft <= 7 && (
            <div className="text-right">
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Trial ending soon!
              </div>
            </div>
          )}
          <button
            onClick={() => navigate('/subscription')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <span>Manage</span>
            <ArrowRightIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {subscription.status === 'trial' && trialDaysLeft <= 7 && (
        <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                Your free trial ends in {trialDaysLeft} days. Upgrade now to continue learning!
              </span>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
            >
              Choose a Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
