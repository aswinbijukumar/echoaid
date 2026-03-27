import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../constants/api';
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function PaymentModal({ isOpen, onClose, selectedPlan, billingCycle, onSuccess }) {
  const { user: _user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [_paymentDetails, _setPaymentDetails] = useState(null);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  const initializePayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded. Please refresh the page.');
      }

      // Create Razorpay order
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('Creating Razorpay order with:', {
        amount: selectedPlan?.price?.[billingCycle] || getPlanPrice(selectedPlan?.id, billingCycle),
        currency: 'INR',
        plan: selectedPlan?.id,
        billingCycle: billingCycle
      });

      const response = await fetch(`${API_BASE_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: selectedPlan?.price?.[billingCycle] || getPlanPrice(selectedPlan?.id, billingCycle),
          currency: 'INR',
          plan: selectedPlan?.id,
          billingCycle: billingCycle
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create payment order (${response.status})`);
      }

      const orderData = await response.json();
      console.log('Order created successfully:', orderData);

      // Initialize Razorpay
      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'EchoAid',
        description: `${selectedPlan?.name || getPlanName(selectedPlan?.id)} Plan - ${billingCycle}`,
        order_id: orderData.data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${API_BASE_URL}/api/subscription/verify-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              setPaymentStatus('success');
              // Call onSuccess callback if provided
              if (onSuccess) {
                onSuccess();
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed');
            setPaymentStatus('failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: _user?.name || '',
          email: _user?.email || ''
        },
        theme: {
          color: '#00CC00'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment cancelled by user');
            setPaymentStatus('failed');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.message);
      setPaymentStatus('failed');
      setLoading(false);
    }
  }, [selectedPlan, billingCycle, _user, onSuccess]);

  useEffect(() => {
    // Manage body scroll
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    console.log('PaymentModal useEffect - isOpen:', isOpen, 'selectedPlan:', selectedPlan);
    if (isOpen && selectedPlan) {
      console.log('Initializing payment for plan:', selectedPlan);
      initializePayment();
    }
  }, [isOpen, selectedPlan, initializePayment]);

  // Payment integration will be added later

  const getPlanPrice = (plan, cycle) => {
    const prices = {
      pro: { monthly: 299, yearly: 2999 },
      premium: { monthly: 599, yearly: 5999 },
      enterprise: { monthly: 999, yearly: 9999 }
    };
    return prices[plan]?.[cycle] || 0;
  };

  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };

  const getPlanName = (plan) => {
    const names = {
      pro: 'Pro',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };
    return names[plan] || plan;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className={`${bg} rounded-lg shadow-xl max-w-md w-full border ${border}`}>
        {/* Header */}
        <div className={`p-6 border-b ${border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${text}`}>
                  Complete Payment
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Upgrade to {selectedPlan?.name || getPlanName(selectedPlan?.id)} Plan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStatus === 'pending' && (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Processing Payment
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please wait while we process your payment...
              </p>
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your subscription has been activated successfully.
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p><strong>Plan:</strong> {selectedPlan?.name || getPlanName(selectedPlan?.id)}</p>
                  <p><strong>Amount:</strong> {formatPrice(selectedPlan?.price?.[billingCycle] || getPlanPrice(selectedPlan?.id, billingCycle))}</p>
                  <p><strong>Billing:</strong> {billingCycle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Payment Failed
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <div className="space-y-2">
                <button
                  onClick={initializePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-center space-x-2">
            <ShieldCheckIcon className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Secure payment powered by Razorpay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}