import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import UserMessageForm from '../components/UserMessageForm';
import { 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  DocumentTextIcon,
  BugAntIcon,
  LightBulbIcon,
  CreditCardIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function UserMessages() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Glass theme variables
  const bg = 'bg-black';
  const text = 'text-white';
  const border = 'border-white/20';
  const textPrimary = 'text-white';
  const textSecondary = 'text-white/70';
  const glassEffect = 'backdrop-blur-md bg-white/5 border border-white/10';
  const glassHover = 'hover:bg-white/10 hover:border-white/20';

  // Category icons (matching backend enum)
  const categoryIcons = {
    general: ChatBubbleLeftRightIcon,
    technical: Cog6ToothIcon,
    account: UserCircleIcon,
    billing: CreditCardIcon,
    learning: DocumentTextIcon
  };

  // Fetch user messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/messages/user/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Failed to load messages: ${errorData.message || 'Unknown error'}`);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle message sent
  const handleMessageSent = () => {
    fetchMessages();
    setShowMessageForm(false);
  };

  // Get status color - glass theme (matching backend)
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-400';
      case 'in-progress': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      case 'closed': return 'text-white/60';
      default: return 'text-white/60';
    }
  };

  // Get priority color - glass theme
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/60';
    }
  };

  // Get status icon - glass theme (matching backend)
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <ExclamationTriangleIcon className="w-4 h-4 text-blue-400" />;
      case 'in-progress': return <EyeIcon className="w-4 h-4 text-yellow-400" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'closed': return <XMarkIcon className="w-4 h-4 text-white/60" />;
      default: return <ClockIcon className="w-4 h-4 text-white/60" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar - Glass Theme */}
      <div className={`${bg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30 backdrop-blur-md bg-black/80`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-blue-400">Messages</span>
            </div>
          </div>
          <TopBarUserAvatar />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="p-6">
            {/* Header - Glass Theme */}
            <div className={`${glassEffect} rounded-xl p-6 mb-6 shadow-2xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Messages & Support</h1>
                  <p className={`text-lg ${textSecondary}`}>Contact our support team and view your message history</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={fetchMessages}
                    disabled={isLoading}
                    className={`px-6 py-3 ${glassEffect} rounded-lg ${text} ${glassHover} transition-all duration-300 flex items-center space-x-2 font-medium`}
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className="px-6 py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium backdrop-blur-md border border-blue-400/30"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>New Message</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Message Form Modal */}
            {showMessageForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <UserMessageForm
                    onMessageSent={handleMessageSent}
                    onClose={() => setShowMessageForm(false)}
                  />
                </div>
              </div>
            )}

            {/* Messages List - Glass Theme */}
            <div className={`${glassEffect} rounded-xl p-6 shadow-2xl`}>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-6`}>Your Messages</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-400" />
                  <span className={`ml-3 text-lg ${textSecondary}`}>Loading messages...</span>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-3 text-red-400 py-6">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  <span className="text-lg">{error}</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16">
                  <ChatBubbleLeftRightIcon className="w-20 h-20 text-white/40 mx-auto mb-6" />
                  <h3 className={`text-2xl font-bold ${textPrimary} mb-3`}>No messages yet</h3>
                  <p className={`text-lg ${textSecondary} mb-6`}>Send your first message to our support team</p>
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className="px-8 py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 font-medium backdrop-blur-md border border-blue-400/30"
                  >
                    Send Message
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => {
                    const CategoryIcon = categoryIcons[message.category] || ChatBubbleLeftRightIcon;
                    return (
                      <div
                        key={message._id}
                        className={`p-6 rounded-xl ${glassEffect} ${glassHover} cursor-pointer transition-all duration-300 shadow-lg ${
                          message.adminReply ? 'ring-2 ring-green-400/30 border-green-400/20' : ''
                        } ${message.status === 'resolved' ? 'ring-2 ring-green-400/20 border-green-400/10' : ''}`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start space-x-6">
                          <div className="flex-shrink-0">
                            <div className={`p-3 rounded-xl bg-blue-500/20 border border-blue-400/30`}>
                              <CategoryIcon className="h-6 w-6 text-blue-400" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h3 className={`text-xl font-bold ${textPrimary} truncate`}>
                                  {message.subject}
                                </h3>
                                {message.adminReply && (
                                  <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs font-semibold rounded-full">
                                    REPLIED
                                  </span>
                                )}
                                {message.status === 'resolved' && (
                                  <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs font-semibold rounded-full">
                                    RESOLVED
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(message.status)}
                                <span className={`text-sm font-semibold ${getStatusColor(message.status)}`}>
                                  {message.status}
                                </span>
                              </div>
                            </div>
                            
                            <p className={`text-base ${textSecondary} mb-4 line-clamp-2`}>
                              {message.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className={`text-sm px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80`}>
                                  {message.category}
                                </span>
                                <span className={`text-sm font-semibold ${getPriorityColor(message.priority)}`}>
                                  {message.priority} priority
                                </span>
                              </div>
                              <span className={`text-sm ${textSecondary}`}>
                                {formatDate(message.createdAt)}
                              </span>
                            </div>

                            {message.adminReply && (
                              <div className={`mt-4 p-4 rounded-xl bg-green-500/10 border border-green-400/30 backdrop-blur-md`}>
                                <div className="flex items-center space-x-3 mb-3">
                                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                  <span className="text-base font-semibold text-green-400">
                                    Admin Reply
                                  </span>
                                  {message.repliedAt && (
                                    <span className="text-sm text-green-400/80">
                                      {formatDate(message.repliedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-base text-green-300">
                                  {message.adminReply}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Detail Modal - Glass Theme */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${glassEffect} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${textPrimary}`}>Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className={`p-3 rounded-xl ${glassHover} ${textSecondary} transition-all duration-300`}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className={`text-lg font-bold ${textPrimary} mb-2`}>Subject</h4>
                  <p className={`text-lg ${textSecondary}`}>{selectedMessage.subject}</p>
                </div>

                <div>
                  <h4 className={`text-lg font-bold ${textPrimary} mb-3`}>Message</h4>
                  <p className={`text-base ${textSecondary} whitespace-pre-wrap leading-relaxed`}>{selectedMessage.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className={`text-base font-semibold ${textPrimary} mb-2`}>Category</h4>
                    <p className={`text-base ${textSecondary}`}>{selectedMessage.category}</p>
                  </div>
                  <div>
                    <h4 className={`text-base font-semibold ${textPrimary} mb-2`}>Priority</h4>
                    <p className={`text-base font-semibold ${getPriorityColor(selectedMessage.priority)}`}>{selectedMessage.priority}</p>
                  </div>
                  <div>
                    <h4 className={`text-base font-semibold ${textPrimary} mb-2`}>Status</h4>
                    <p className={`text-base font-semibold ${getStatusColor(selectedMessage.status)}`}>{selectedMessage.status}</p>
                  </div>
                  <div>
                    <h4 className={`text-base font-semibold ${textPrimary} mb-2`}>Sent</h4>
                    <p className={`text-base ${textSecondary}`}>{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>

                {selectedMessage.adminReply && (
                  <div className={`p-6 rounded-xl bg-green-500/10 border border-green-400/30 backdrop-blur-md`}>
                    <h4 className={`text-lg font-bold text-green-400 mb-3`}>Admin Reply</h4>
                    <p className="text-base text-green-300 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.adminReply}
                    </p>
                    {selectedMessage.repliedAt && (
                      <p className="text-sm text-green-400/80 mt-3">
                        Replied on {formatDate(selectedMessage.repliedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
