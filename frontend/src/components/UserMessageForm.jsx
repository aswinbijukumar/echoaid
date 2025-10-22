import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextConstants';
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
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Glass theme variables
  const bg = 'bg-black';
  const text = 'text-white';
  const cardBg = 'bg-white/5 backdrop-blur-md border border-white/10';
  const border = 'border-white/20';
  const textPrimary = 'text-white';
  const textSecondary = 'text-white/70';
  const hoverBg = 'hover:bg-white/10';
  const glassEffect = 'backdrop-blur-md bg-white/5 border border-white/10';
  const glassHover = 'hover:bg-white/10 hover:border-white/20';

  // Category options with icons (matching backend enum)
  const categories = [
    { value: 'general', label: 'General Inquiry', icon: ChatBubbleLeftRightIcon, description: 'General questions and feedback' },
    { value: 'technical', label: 'Technical Issue', icon: Cog6ToothIcon, description: 'App problems, bugs, or technical issues' },
    { value: 'account', label: 'Account Help', icon: UserCircleIcon, description: 'Login, verification, or account issues' },
    { value: 'billing', label: 'Billing & Subscription', icon: CreditCardIcon, description: 'Payment, subscription, or billing questions' },
    { value: 'learning', label: 'Learning Content', icon: DocumentTextIcon, description: 'Questions about lessons, quizzes, or content' }
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
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/60';
    }
  };

  return (
    <div className={`${glassEffect} rounded-2xl p-8 shadow-2xl`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-blue-500/20 border border-blue-400/30`}>
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${textPrimary}`}>Send Message</h3>
            <p className={`text-lg ${textSecondary}`}>Contact our support team</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-3 rounded-xl ${glassHover} ${textSecondary} transition-all duration-300`}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject */}
        <div>
          <label className={`block text-base font-semibold ${textSecondary} mb-3`}>
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief description of your message"
            className={`w-full px-4 py-3 border ${border} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 ${glassEffect} ${textPrimary} placeholder-white/50 transition-all duration-300`}
            required
            maxLength={200}
          />
        </div>

        {/* Category */}
        <div>
          <label className={`block text-base font-semibold ${textSecondary} mb-3`}>
            Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <label
                  key={category.value}
                  className={`flex items-start space-x-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    formData.category === category.value
                      ? `border-blue-400/50 bg-blue-500/10`
                      : `${glassEffect} ${glassHover}`
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
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-blue-400" />
                      <span className={`text-base font-semibold ${textPrimary}`}>
                        {category.label}
                      </span>
                    </div>
                    <p className={`text-sm ${textSecondary} mt-2`}>
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
          <label className={`block text-base font-semibold ${textSecondary} mb-3`}>
            Priority
          </label>
          <div className="flex flex-wrap gap-3">
            {priorities.map((priority) => (
              <label
                key={priority.value}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                  formData.priority === priority.value
                    ? `border-blue-400/50 bg-blue-500/10`
                    : `${glassEffect} ${glassHover}`
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={handleInputChange}
                />
                <span className={`text-base font-semibold ${getPriorityColor(priority.value)}`}>
                  {priority.label}
                </span>
              </label>
            ))}
          </div>
          <p className={`text-sm ${textSecondary} mt-3`}>
            {priorities.find(p => p.value === formData.priority)?.description}
          </p>
        </div>

        {/* Message */}
        <div>
          <label className={`block text-base font-semibold ${textSecondary} mb-3`}>
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Please provide detailed information about your inquiry..."
            rows={6}
            className={`w-full px-4 py-3 border ${border} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 ${glassEffect} ${textPrimary} placeholder-white/50 transition-all duration-300 resize-none`}
            required
            maxLength={2000}
          />
          <p className={`text-sm ${textSecondary} mt-2`}>
            {formData.message.length}/2000 characters
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-3 text-red-400 p-4 rounded-xl bg-red-500/10 border border-red-400/30">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span className="text-base font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-3 text-green-400 p-4 rounded-xl bg-green-500/10 border border-green-400/30">
            <CheckCircleIcon className="w-6 h-6" />
            <span className="text-base font-medium">{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex space-x-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 border ${border} rounded-xl ${textPrimary} ${glassHover} transition-all duration-300 font-medium`}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-6 py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-3 font-medium backdrop-blur-md border border-blue-400/30`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
          </button>
        </div>

        {/* View Messages Link */}
        <div className="text-center pt-6 border-t border-white/20">
          <Link
            to="/support"
            className={`text-base ${textSecondary} hover:${textPrimary} transition-colors font-medium`}
          >
            View your message history and replies
          </Link>
        </div>
      </form>
    </div>
  );
}