import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
import { 
  BellIcon,
  XMarkIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function MessagesNotification() {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    unreadOnly: false
  });
  const dropdownRef = useRef(null);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // Fetch messages
  const fetchMessages = async () => {
    setIsLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.unreadOnly) queryParams.append('unreadOnly', 'true');
      queryParams.append('limit', '10');

      const response = await fetch(`http://localhost:5000/api/messages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages || []);
        setUnreadCount(data.data.unreadCount || 0);
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isReadByAdmin: true, status: 'read' }
            : msg
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status, isRead) => {
    if (!isRead) return <ExclamationTriangleIcon className="w-4 h-4 text-blue-500" />;
    switch (status) {
      case 'replied': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'closed': return <XMarkIcon className="w-4 h-4 text-gray-500" />;
      default: return <ClockIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Load messages on mount and when filters change
  useEffect(() => {
    if (showDropdown) {
      fetchMessages();
    }
  }, [showDropdown, filters]);

  // Auto-refresh unread count
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showDropdown) {
        fetchMessages();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [showDropdown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-lg border transition-all duration-200 ${bg} ${border} ${text} ${hoverBg}`}
        title="Messages & Queries"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className={`absolute right-0 top-full mt-2 w-96 rounded-lg shadow-xl border z-50 ${cardBg} ${border}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${textPrimary} flex items-center space-x-2`}>
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Messages & Queries</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </h3>
              <button
                onClick={fetchMessages}
                disabled={isLoading}
                className={`p-1 rounded ${hoverBg} ${textSecondary}`}
                title="Refresh"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className={`text-xs px-2 py-1 rounded border ${border} ${bg} ${textPrimary}`}
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className={`text-xs px-2 py-1 rounded border ${border} ${bg} ${textPrimary}`}
              >
                <option value="">All Categories</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="billing">Billing</option>
                <option value="content">Content</option>
                <option value="general">General</option>
              </select>

              <label className="flex items-center space-x-1 text-xs">
                <input
                  type="checkbox"
                  checked={filters.unreadOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                  className="rounded"
                />
                <span className={textSecondary}>Unread only</span>
              </label>
            </div>
          </div>

          {/* Messages List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
                <span className={`ml-2 ${textSecondary}`}>Loading messages...</span>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 p-4">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className={textSecondary}>No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`p-4 ${hoverBg} cursor-pointer transition-colors ${
                      !message.isReadByAdmin ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => markAsRead(message._id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(message.status, message.isReadByAdmin)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${textPrimary} truncate`}>
                            {message.subject}
                          </p>
                          <span className={`text-xs ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        </div>
                        
                        <p className={`text-xs ${textSecondary} mt-1 line-clamp-2`}>
                          {message.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs ${textSecondary}`}>
                              {message.userName || message.userEmail}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {message.category}
                            </span>
                          </div>
                          <span className={`text-xs ${textSecondary}`}>
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                // Navigate to full messages page
                window.location.href = '/admin/messages';
              }}
              className={`w-full text-sm ${textPrimary} ${hoverBg} py-2 rounded transition-colors`}
            >
              View All Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
}