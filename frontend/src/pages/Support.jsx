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
  TagIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Support() {
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessageForm, setShowNewMessageForm] = useState(true);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/user/messages`, {
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

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
      });
      
      if (response.ok) {
        setNewMessage({ subject: '', message: '', category: 'general', priority: 'medium' });
        setShowNewMessageForm(false);
        fetchMessages(); // Refresh messages
        alert('Message sent successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'in-progress':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-100';
      case 'high':
        return 'text-orange-500 bg-orange-100';
      case 'medium':
        return 'text-blue-500 bg-blue-100';
      case 'low':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
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
      {/* Top Status Bar - fixed so it doesn't scroll horizontally */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 fixed top-0 left-0 right-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-blue-500">SUPPORT & MESSAGES</span>
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
          <div className="max-w-4xl mx-auto">
            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowNewMessageForm(!showNewMessageForm)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showNewMessageForm 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                {showNewMessageForm ? 'Hide Form' : 'Send New Message'}
              </button>
              <button
                onClick={fetchMessages}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <EyeIcon className="w-5 h-5" />
                Refresh Messages
              </button>
            </div>

            {/* New Message Form */}
            {showNewMessageForm && (
              <div className={`${cardBg} rounded-lg p-6 mb-6 border ${border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${text}`}>Send New Message</h3>
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${text}`}>Subject</label>
                    <input
                      type="text"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      className={`w-full px-3 py-2 border ${border} rounded-lg ${bg} ${text} focus:outline-none focus:ring-2 focus:ring-green-500`}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${text}`}>Category</label>
                      <select
                        value={newMessage.category}
                        onChange={(e) => setNewMessage({ ...newMessage, category: e.target.value })}
                        className={`w-full px-3 py-2 border ${border} rounded-lg ${bg} ${text} focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="learning">Learning</option>
                        <option value="account">Account</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${text}`}>Priority</label>
                      <select
                        value={newMessage.priority}
                        onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                        className={`w-full px-3 py-2 border ${border} rounded-lg ${bg} ${text} focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${text}`}>Message</label>
                    <textarea
                      value={newMessage.message}
                      onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                      className={`w-full px-3 py-2 border ${border} rounded-lg ${bg} ${text} focus:outline-none focus:ring-2 focus:ring-green-500`}
                      rows="4"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewMessageForm(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Messages List */}
            <div className="space-y-4">
              <h2 className={`text-xl font-semibold ${text}`}>Your Messages</h2>
              
              {messages.length === 0 ? (
                <div className={`${cardBg} rounded-lg p-8 text-center border ${border}`}>
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className={`${text} opacity-70 mb-4`}>No messages yet. Send your first message to get support!</p>
                  <button
                    onClick={() => setShowNewMessageForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Send Your First Message
                  </button>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message._id} className={`${cardBg} rounded-lg p-6 border ${border}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(message.status)}
                        <div>
                          <h3 className={`font-semibold ${text}`}>{message.subject}</h3>
                          <p className={`text-sm ${text} opacity-70`}>
                            {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${message.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`${text} mb-4`}>
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                    
                    {message.adminReply && (
                      <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg`}>
                        <div className="flex items-center gap-2 mb-2">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Admin Reply</span>
                          {message.repliedAt && (
                            <span className="text-xs text-blue-600">
                              {new Date(message.repliedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-blue-800 whitespace-pre-wrap">{message.adminReply}</p>
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