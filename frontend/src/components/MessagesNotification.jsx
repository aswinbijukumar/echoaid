import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextConstants';
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
  const navigate = useNavigate();
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

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/messages/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadMessages || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

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

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/messages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages || []);
        // Get unread count from stats
        fetchUnreadCount();
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ readBy: 'admin' })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isReadByAdmin: true }
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
        fetchUnreadCount();
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
        <div className={`absolute right-0 top-full mt-2 w-96 rounded-xl shadow-2xl border z-50 ${glassEffect}`}>
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${textPrimary} flex items-center space-x-3`}>
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-400" />
                <span>Messages & Queries</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500/80 text-white text-sm px-3 py-1 rounded-full font-semibold backdrop-blur-md border border-red-400/30">
                    {unreadCount} unread
                  </span>
                )}
              </h3>
              <button
                onClick={fetchMessages}
                disabled={isLoading}
                className={`p-2 rounded-xl ${glassHover} ${textSecondary} transition-all duration-300`}
                title="Refresh"
              >
                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className={`text-sm px-3 py-2 rounded-xl border ${border} ${glassEffect} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 bg-black/80`}
              >
                <option value="" className="bg-black text-white">All Status</option>
                <option value="open" className="bg-black text-blue-400">🔵 Open</option>
                <option value="in-progress" className="bg-black text-yellow-400">🟡 In Progress</option>
                <option value="resolved" className="bg-black text-green-400">🟢 Resolved</option>
                <option value="closed" className="bg-black text-white/60">⚫ Closed</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className={`text-sm px-3 py-2 rounded-xl border ${border} ${glassEffect} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 bg-black/80`}
              >
                <option value="" className="bg-black text-white">All Categories</option>
                <option value="general" className="bg-black text-white">💬 General</option>
                <option value="technical" className="bg-black text-blue-400">⚙️ Technical</option>
                <option value="billing" className="bg-black text-green-400">💳 Billing</option>
                <option value="learning" className="bg-black text-purple-400">📚 Learning</option>
                <option value="account" className="bg-black text-orange-400">👤 Account</option>
              </select>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.unreadOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                  className="rounded border-white/20 bg-white/5 text-blue-400 focus:ring-blue-400/50"
                />
                <span className={textSecondary}>Unread only</span>
              </label>
            </div>
          </div>

          {/* Messages List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-400" />
                <span className={`ml-3 text-lg ${textSecondary}`}>Loading messages...</span>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-3 text-red-400 p-6">
                <ExclamationTriangleIcon className="w-6 h-6" />
                <span className="text-base">{error}</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className={`text-lg ${textSecondary}`}>No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/20">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`p-6 ${glassHover} cursor-pointer transition-all duration-300 ${
                      !message.isReadByAdmin ? 'ring-2 ring-yellow-400/30 border-yellow-400/20' : ''
                    }`}
                    onClick={() => markAsRead(message._id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(message.status, message.isReadByAdmin)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <p className={`text-base font-semibold ${textPrimary} truncate`}>
                              {message.subject}
                            </p>
                            {!message.isReadByAdmin && (
                              <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-semibold rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className={`text-sm font-semibold ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${textSecondary} mb-3 line-clamp-2`}>
                          {message.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm ${textSecondary}`}>
                              {message.userName || message.userEmail}
                            </span>
                            <span className={`text-sm px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80`}>
                              {message.category}
                            </span>
                          </div>
                          <span className={`text-sm ${textSecondary}`}>
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
          <div className="p-4 border-t border-white/20">
            <button
              onClick={() => {
                // Navigate to full messages page
                navigate('/admin/messages');
              }}
              className={`w-full text-base font-medium ${textPrimary} ${glassHover} py-3 rounded-xl transition-all duration-300`}
            >
              View All Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
}