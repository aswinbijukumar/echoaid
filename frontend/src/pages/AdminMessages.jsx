import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import { 
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  UserIcon,
  TagIcon,
  FunnelIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminMessages() {
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [stats, setStats] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  // Glass theme variables
  const bg = 'bg-black';
  const text = 'text-white';
  const border = 'border-white/20';
  const cardBg = 'bg-white/5 backdrop-blur-md border border-white/10';
  const statusBarBg = 'bg-black/80 backdrop-blur-md';
  const glassEffect = 'backdrop-blur-md bg-white/5 border border-white/10';
  const glassHover = 'hover:bg-white/10 hover:border-white/20';
  const textPrimary = 'text-white';
  const textSecondary = 'text-white/70';

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filters]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.category) queryParams.append('category', filters.category);
      
      const response = await fetch(`${API_BASE_URL}/messages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;
    
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}/reply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminReply: replyText })
      });
      
      if (response.ok) {
        setReplyText('');
        setSelectedMessage(null);
        fetchMessages();
        fetchStats();
        alert('Reply sent successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusUpdate = async (messageId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ readBy: 'admin' })
      });
      
      if (response.ok) {
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      case 'in-progress':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-400" />;
      case 'resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'closed':
        return <CheckCircleIcon className="w-5 h-5 text-white/60" />;
      default:
        return <ClockIcon className="w-5 h-5 text-white/60" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/10 border border-red-400/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border border-orange-400/30';
      case 'medium':
        return 'text-blue-400 bg-blue-500/10 border border-blue-400/30';
      case 'low':
        return 'text-white/60 bg-white/10 border border-white/20';
      default:
        return 'text-white/60 bg-white/10 border border-white/20';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className={`mt-4 ${text}`}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Top Status Bar - Glass Theme */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 fixed top-0 left-0 right-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-blue-400">ADMIN MESSAGES</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <TopBarUserAvatar size={8} showName={false} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content */}
        <div className={`flex-1 ml-64 ${bg} min-h-screen pt-[52px] px-6`}>
          <div className="max-w-6xl mx-auto">
            {/* Stats Cards - Glass Theme */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`${glassEffect} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-4">
                  <ChatBubbleLeftRightIcon className="w-10 h-10 text-blue-400" />
                  <div>
                    <p className={`text-base ${textSecondary}`}>Total Messages</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>{stats.totalMessages || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className={`${glassEffect} rounded-xl p-6 shadow-lg ${(stats.unreadMessages || 0) > 0 ? 'ring-2 ring-yellow-400/50 border-yellow-400/30' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <BellIcon className="w-10 h-10 text-yellow-400" />
                    {(stats.unreadMessages || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-base ${textSecondary}`}>Unread</p>
                    <p className={`text-3xl font-bold ${(stats.unreadMessages || 0) > 0 ? 'text-yellow-400' : textPrimary}`}>
                      {stats.unreadMessages || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`${glassEffect} rounded-xl p-6 shadow-lg ${(stats.urgentMessages || 0) > 0 ? 'ring-2 ring-red-400/50 border-red-400/30' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
                    {(stats.urgentMessages || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-base ${textSecondary}`}>Urgent</p>
                    <p className={`text-3xl font-bold ${(stats.urgentMessages || 0) > 0 ? 'text-red-400' : textPrimary}`}>
                      {stats.urgentMessages || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`${glassEffect} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-400" />
                  <div>
                    <p className={`text-base ${textSecondary}`}>Resolved</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>
                      {stats.statusBreakdown?.find(s => s._id === 'resolved')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters - Glass Theme */}
            <div className={`${glassEffect} rounded-xl p-6 mb-8 shadow-lg`}>
              <div className="flex items-center gap-6">
                <FunnelIcon className="w-6 h-6 text-white/60" />
                <span className={`text-lg font-semibold ${textPrimary}`}>Filters:</span>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className={`px-4 py-3 border ${border} rounded-xl ${glassEffect} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 bg-black/80`}
                >
                  <option value="" className="bg-black text-white">All Status</option>
                  <option value="open" className="bg-black text-blue-400">🔵 Open</option>
                  <option value="in-progress" className="bg-black text-yellow-400">🟡 In Progress</option>
                  <option value="resolved" className="bg-black text-green-400">🟢 Resolved</option>
                  <option value="closed" className="bg-black text-white/60">⚫ Closed</option>
                </select>
                
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className={`px-4 py-3 border ${border} rounded-xl ${glassEffect} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 bg-black/80`}
                >
                  <option value="" className="bg-black text-white">All Priority</option>
                  <option value="urgent" className="bg-black text-red-400">🔴 Urgent</option>
                  <option value="high" className="bg-black text-orange-400">🟠 High</option>
                  <option value="medium" className="bg-black text-yellow-400">🟡 Medium</option>
                  <option value="low" className="bg-black text-green-400">🟢 Low</option>
                </select>
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className={`px-4 py-3 border ${border} rounded-xl ${glassEffect} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 bg-black/80`}
                >
                  <option value="" className="bg-black text-white">All Categories</option>
                  <option value="general" className="bg-black text-white">💬 General</option>
                  <option value="technical" className="bg-black text-blue-400">⚙️ Technical</option>
                  <option value="billing" className="bg-black text-green-400">💳 Billing</option>
                  <option value="learning" className="bg-black text-purple-400">📚 Learning</option>
                  <option value="account" className="bg-black text-orange-400">👤 Account</option>
                </select>
              </div>
            </div>

            {/* Messages List - Glass Theme */}
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className={`${glassEffect} rounded-xl p-12 text-center shadow-lg`}>
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-white/40 mb-6" />
                  <p className={`text-xl ${textSecondary}`}>No messages found.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message._id} 
                    className={`${glassEffect} rounded-xl p-8 shadow-lg cursor-pointer transition-all duration-300 ${
                      !message.isReadByAdmin ? 'ring-2 ring-yellow-400/30 border-yellow-400/20' : ''
                    } ${message.priority === 'urgent' ? 'ring-2 ring-red-400/30 border-red-400/20' : ''}`}
                    onClick={() => {
                      if (!message.isReadByAdmin) {
                        markAsRead(message._id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {getStatusIcon(message.status)}
                          {!message.isReadByAdmin && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                          )}
                          {message.priority === 'urgent' && (
                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-400 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-xl font-bold ${textPrimary}`}>{message.subject}</h3>
                            {!message.isReadByAdmin && (
                              <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-semibold rounded-full">
                                NEW
                              </span>
                            )}
                            {message.priority === 'urgent' && (
                              <span className="px-2 py-1 bg-red-400/20 text-red-400 text-xs font-semibold rounded-full">
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className={`text-base ${textSecondary}`}>
                            From: {message.sender?.name || 'Unknown User'} • 
                            {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-2 rounded-xl text-sm font-semibold ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        <span className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                          message.status === 'resolved' ? 'bg-green-500/10 text-green-400 border border-green-400/30' : 
                          message.status === 'open' ? 'bg-blue-500/10 text-blue-400 border border-blue-400/30' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-400/30'
                        }`}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`${textPrimary} mb-6`}>
                      <p className="text-base whitespace-pre-wrap leading-relaxed">{message.message}</p>
                    </div>
                    
                    {message.adminReply && (
                      <div className={`bg-green-500/10 border border-green-400/30 p-6 rounded-xl mb-6 backdrop-blur-md`}>
                        <div className="flex items-center gap-3 mb-3">
                          <UserIcon className="w-5 h-5 text-green-400" />
                          <span className="text-base font-semibold text-green-400">Your Reply</span>
                          {message.repliedAt && (
                            <span className="text-sm text-green-400/80">
                              {new Date(message.repliedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-green-300 whitespace-pre-wrap leading-relaxed">{message.adminReply}</p>
                      </div>
                    )}
                    
                    {/* Admin Actions - Glass Theme */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                      {!message.isReadByAdmin && (
                        <button
                          onClick={() => markAsRead(message._id)}
                          className="flex items-center gap-3 px-6 py-3 bg-yellow-500/80 text-white rounded-xl hover:bg-yellow-500 transition-all duration-300 text-base font-medium backdrop-blur-md border border-yellow-400/30"
                        >
                          <EyeIcon className="w-5 h-5" />
                          Mark as Read
                        </button>
                      )}
                      
                      {!message.adminReply && (
                        <button
                          onClick={() => setSelectedMessage(selectedMessage === message._id ? null : message._id)}
                          className="flex items-center gap-3 px-6 py-3 bg-blue-500/80 text-white rounded-xl hover:bg-blue-500 transition-all duration-300 text-base font-medium backdrop-blur-md border border-blue-400/30"
                        >
                          <PaperAirplaneIcon className="w-5 h-5" />
                          Reply
                        </button>
                      )}
                      
                      <select
                        value={message.status}
                        onChange={(e) => handleStatusUpdate(message._id, e.target.value)}
                        className={`px-4 py-3 border ${border} rounded-xl ${glassEffect} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-base`}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    
                    {/* Reply Form - Glass Theme */}
                    {selectedMessage === message._id && (
                      <div className="mt-6 p-6 bg-blue-500/10 border border-blue-400/30 rounded-xl backdrop-blur-md">
                        <label className={`block text-base font-semibold mb-3 ${textPrimary}`}>Your Reply</label>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className={`w-full px-4 py-3 border ${border} rounded-xl ${glassEffect} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 placeholder-white/50 resize-none`}
                          rows="4"
                          placeholder="Type your reply here..."
                        />
                        <div className="flex gap-4 mt-4">
                          <button
                            onClick={() => handleReply(message._id)}
                            disabled={submittingReply || !replyText.trim()}
                            className="flex items-center gap-3 px-6 py-3 bg-green-500/80 text-white rounded-xl hover:bg-green-500 disabled:opacity-50 transition-all duration-300 text-base font-medium backdrop-blur-md border border-green-400/30"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                            {submittingReply ? 'Sending...' : 'Send Reply'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMessage(null);
                              setReplyText('');
                            }}
                            className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-base font-medium border border-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}