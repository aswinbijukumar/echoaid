import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { 
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BugAntIcon,
  LightBulbIcon,
  CreditCardIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function UserMessageForm({ onMessageSent, onClose }) {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // Category options with icons
  const categories = [
    { value: 'general', label: 'General Inquiry', icon: ChatBubbleLeftRightIcon, description: 'General questions and feedback' },
    { value: 'technical', label: 'Technical Issue', icon: Cog6ToothIcon, description: 'App problems, bugs, or technical issues' },
    { value: 'account', label: 'Account Help', icon: UserCircleIcon, description: 'Login, verification, or account issues' },
    { value: 'billing', label: 'Billing & Subscription', icon: CreditCardIcon, description: 'Payment, subscription, or billing questions' },
    { value: 'content', label: 'Learning Content', icon: DocumentTextIcon, description: 'Questions about lessons, quizzes, or content' },
    { value: 'bug_report', label: 'Bug Report', icon: BugAntIcon, description: 'Report a specific bug or issue' },
    { value: 'feature_request', label: 'Feature Request', icon: LightBulbIcon, description: 'Suggest new features or improvements' }
  ];

  // Priority options
  const priorities = [
    { value: 'low', label: 'Low', description: 'General question, not urgent' },
    { value: 'medium', label: 'Medium', description: 'Standard priority (default)' },
    { value: 'high', label: 'High', description: 'Important issue, needs prompt response' },
    { value: 'urgent', label: 'Urgent', description: 'Critical issue, needs immediate attention' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Message sent successfully! We\'ll get back to you soon.');
        setFormData({
          subject: '',
          message: '',
          category: 'general',
          priority: 'medium'
        });
        
        // Call callback if provided
        if (onMessageSent) {
          onMessageSent();
        }
        
        // Auto-close after success
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`${cardBg} rounded-lg border ${border} p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Send Message</h3>
            <p className={`text-sm ${textSecondary}`}>Contact our support team</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief description of your message"
            className={`w-full px-3 py-2 border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${bg} ${textPrimary}`}
            required
            maxLength={200}
          />
        </div>

        {/* Category */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <label
                  key={category.value}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.category === category.value
                      ? `${darkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50'}`
                      : `${border} ${hoverBg}`
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={formData.category === category.value}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                      <span className={`text-sm font-medium ${textPrimary}`}>
                        {category.label}
                      </span>
                    </div>
                    <p className={`text-xs ${textSecondary} mt-1`}>
                      {category.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => (
              <label
                key={priority.value}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  formData.priority === priority.value
                    ? `${darkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-50'}`
                    : `${border} ${hoverBg}`
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={handleInputChange}
                />
                <span className={`text-sm font-medium ${getPriorityColor(priority.value)}`}>
                  {priority.label}
                </span>
              </label>
            ))}
          </div>
          <p className={`text-xs ${textSecondary} mt-2`}>
            {priorities.find(p => p.value === formData.priority)?.description}
          </p>
        </div>

        {/* Message */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Please provide detailed information about your inquiry..."
            rows={6}
            className={`w-full px-3 py-2 border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${bg} ${textPrimary}`}
            required
            maxLength={2000}
          />
          <p className={`text-xs ${textSecondary} mt-1`}>
            {formData.message.length}/2000 characters
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 border ${border} rounded-lg ${textPrimary} ${hoverBg} transition-colors`}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2`}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
          </button>
        </div>

        {/* View Messages Link */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/messages"
            className={`text-sm ${textSecondary} hover:${textPrimary} transition-colors`}
          >
            View your message history and replies
          </Link>
        </div>
      </form>
    </div>
  );
}