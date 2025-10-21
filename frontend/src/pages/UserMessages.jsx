import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { useTheme } from '../hooks/useTheme';
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
  const { token, user } = useAuth();
  const { darkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // Category icons
  const categoryIcons = {
    general: ChatBubbleLeftRightIcon,
    technical: Cog6ToothIcon,
    account: UserCircleIcon,
    billing: CreditCardIcon,
    content: DocumentTextIcon,
    bug_report: BugAntIcon,
    feature_request: LightBulbIcon
  };

  // Fetch user messages
  const fetchMessages = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages || []);
      } else {
        setError('Failed to load messages');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages on mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle message sent
  const handleMessageSent = () => {
    fetchMessages();
    setShowMessageForm(false);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-blue-600 dark:text-blue-400';
      case 'read': return 'text-yellow-600 dark:text-yellow-400';
      case 'replied': return 'text-green-600 dark:text-green-400';
      case 'resolved': return 'text-green-600 dark:text-green-400';
      case 'closed': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
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
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <ExclamationTriangleIcon className="w-4 h-4 text-blue-500" />;
      case 'read': return <EyeIcon className="w-4 h-4 text-yellow-500" />;
      case 'replied': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'closed': return <XMarkIcon className="w-4 h-4 text-gray-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
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
      {/* Top Status Bar */}
      <div className={`${bg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
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
            {/* Header */}
            <div className={`${cardBg} rounded-lg border ${border} p-6 mb-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${textPrimary}`}>Messages & Support</h1>
                  <p className={`text-lg ${textSecondary} mt-2`}>Contact our support team and view your message history</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={fetchMessages}
                    disabled={isLoading}
                    className={`px-4 py-2 ${cardBg} border ${border} rounded-lg ${text} ${hoverBg} transition-all duration-200 flex items-center space-x-2`}
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
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

            {/* Messages List */}
            <div className={`${cardBg} rounded-lg border ${border} p-6`}>
              <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>Your Messages</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
                  <span className={`ml-2 ${textSecondary}`}>Loading messages...</span>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 py-4">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No messages yet</h3>
                  <p className={`${textSecondary} mb-4`}>Send your first message to our support team</p>
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const CategoryIcon = categoryIcons[message.category] || ChatBubbleLeftRightIcon;
                    return (
                      <div
                        key={message._id}
                        className={`p-4 rounded-lg border ${border} ${hoverBg} cursor-pointer transition-colors`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                              <CategoryIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`text-lg font-medium ${textPrimary} truncate`}>
                                {message.subject}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(message.status)}
                                <span className={`text-sm font-medium ${getStatusColor(message.status)}`}>
                                  {message.status}
                                </span>
                              </div>
                            </div>
                            
                            <p className={`text-sm ${textSecondary} mb-3 line-clamp-2`}>
                              {message.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {message.category}
                                </span>
                                <span className={`text-xs font-medium ${getPriorityColor(message.priority)}`}>
                                  {message.priority} priority
                                </span>
                              </div>
                              <span className={`text-xs ${textSecondary}`}>
                                {formatDate(message.createdAt)}
                              </span>
                            </div>

                            {message.reply && (
                              <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Admin Reply
                                  </span>
                                  {message.repliedAt && (
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                      {formatDate(message.repliedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  {message.reply}
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-lg border ${border} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${textPrimary}`}>Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className={`font-medium ${textPrimary}`}>Subject</h4>
                  <p className={`${textSecondary}`}>{selectedMessage.subject}</p>
                </div>

                <div>
                  <h4 className={`font-medium ${textPrimary}`}>Message</h4>
                  <p className={`${textSecondary} whitespace-pre-wrap`}>{selectedMessage.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-medium ${textPrimary}`}>Category</h4>
                    <p className={`${textSecondary}`}>{selectedMessage.category}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${textPrimary}`}>Priority</h4>
                    <p className={`${getPriorityColor(selectedMessage.priority)}`}>{selectedMessage.priority}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${textPrimary}`}>Status</h4>
                    <p className={`${getStatusColor(selectedMessage.status)}`}>{selectedMessage.status}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${textPrimary}`}>Sent</h4>
                    <p className={`${textSecondary}`}>{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>

                {selectedMessage.reply && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                    <h4 className={`font-medium text-green-600 dark:text-green-400 mb-2`}>Admin Reply</h4>
                    <p className="text-green-700 dark:text-green-300 whitespace-pre-wrap">
                      {selectedMessage.reply}
                    </p>
                    {selectedMessage.repliedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
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