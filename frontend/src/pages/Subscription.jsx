import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { CheckIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import PaymentModal from '../components/PaymentModal';

export default function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const { user, refreshUser } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Basic sign language learning',
        'Limited quiz attempts (5 per day)',
        'Limited learning modules (3 per day)',
        'Basic progress tracking',
        'Community support',
        'Mobile app access'
      ],
      limitations: [
        'Limited to 5 quizzes per day',
        'Limited to 3 learning modules per day',
        'Basic analytics only',
        'Standard support',
        '14-day trial period'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 299, yearly: 2999 },
      description: 'Most popular for serious learners',
      features: [
        'Unlimited quizzes and practice',
        'Advanced progress analytics',
        'Priority customer support',
        'Offline mode access',
        'Advanced gamification',
        'Custom learning paths',
        'Export progress reports'
      ],
      limitations: [],
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
      popular: false
    }
  ];

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchSubscription();
        await refreshUser(); // Refresh user data in AuthContext
        alert('Subscription cancelled successfully');
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription. Please try again.');
    }
  };

  const getCurrentPlan = () => {
    return subscriptionPlans.find(plan => plan.id === subscription?.plan) || subscriptionPlans[0];
  };

  const getTrialDaysLeft = () => {
    if (!subscription?.trialEndDate) return 0;
    const trialEnd = new Date(subscription.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00CC00] mx-auto"></div>
          <p className="mt-4">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-center mb-4">Subscription Plans</h1>
          <p className="text-center text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your sign language learning journey
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className={`${cardBg} rounded-2xl p-6 mb-8 border ${border}`}>
            <h2 className="text-2xl font-bold mb-4">Current Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{getCurrentPlan().name}</h3>
                <p className="text-gray-400">
                  {subscription.status === 'trial' 
                    ? `Trial ends in ${getTrialDaysLeft()} days`
                    : subscription.status === 'active' && subscription.subscriptionEndDate
                    ? `Active until ${new Date(subscription.subscriptionEndDate).toLocaleDateString()}`
                    : 'Subscription expired'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                  subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
                {subscription.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className={`${cardBg} p-1 rounded-lg border ${border}`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-[#00CC00] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-[#00CC00] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isFree = plan.id === 'free';
            
            return (
              <div
                key={plan.id}
                className={`${cardBg} rounded-2xl p-8 border ${border} relative ${
                  plan.popular ? 'ring-2 ring-[#00CC00]' : ''
                } ${isCurrentPlan ? 'opacity-75' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#00CC00] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">
                      ₹{plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-400">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                    <p className="text-sm text-green-400">
                      Save ₹{plan.price.monthly * 12 - plan.price.yearly} per year
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-semibold mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <XMarkIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-400">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrentPlan || isFree}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : isFree
                      ? 'bg-gray-600 text-white cursor-not-allowed'
                      : plan.popular
                      ? 'bg-[#00CC00] text-white hover:bg-[#00AA00]'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : isFree ? 'Free Forever' : 'Upgrade Now'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className={`${cardBg} rounded-2xl p-8 border ${border}`}>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">Yes, all new users get a 7-day free trial of Premium features to explore the platform.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedPlan={selectedPlan}
          billingCycle={billingCycle}
          onSuccess={async () => {
            setShowPaymentModal(false);
            await fetchSubscription();
            await refreshUser(); // Refresh user data in AuthContext
          }}
        />
      )}
    </div>
  );
}