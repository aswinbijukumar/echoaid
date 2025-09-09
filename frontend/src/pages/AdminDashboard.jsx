import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UsersIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  FireIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  UserCircleIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  CheckBadgeIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon,
  ChartPieIcon,
  UserGroupIcon,
  TicketIcon,
  BellIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ArrowsUpDownIcon,
  FolderIcon,
  PlayIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ContentManagement from '../components/ContentManagement';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [userQueries, setUserQueries] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Content Management States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'alphabet',
    level: 'beginner',
    file: null,
    filePreview: null
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    level: ''
  });
  
  // User Support States
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Moderation States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportNote, setReportNote] = useState('');
  
  // Section Assignment States
  const [assignedSection] = useState('alphabet');
  
  // Analytics States
  
  const fileInputRef = useRef(null);
  
  const { darkMode } = useTheme();
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [contentItemsCount, setContentItemsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get content statistics
        const response = await fetch('http://localhost:5000/api/admin/content/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setContentItemsCount(data.data.totalSigns || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchContentItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/content/signs?limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Use pagination total if available
          if (data.pagination && data.pagination.totalItems !== undefined) {
            setContentItemsCount(data.pagination.totalItems);
          }
          setContentItems(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching content items:', error);
        setContentItems([]);
      }
    };

    const fetchUserStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTotalUsersCount(data.data.totalUsers || 0);
          setActiveUsersCount(data.data.activeUsers || 0);
        }
      } catch (e) {
        console.error('Error fetching user stats:', e);
      }
    };

    const fetchPendingReviews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/content/queue', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPendingReviewsCount((data.data || []).length);
        }
      } catch (e) {
        console.error('Error fetching pending reviews:', e);
      }
    };

    const fetchUserQueries = async () => {
      // Mock user queries data since the endpoint doesn't exist
      setUserQueries([
        {
          id: 1,
          subject: 'Need help with sign language',
          user: 'john.doe@example.com',
          priority: 'medium',
          status: 'open',
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          id: 2,
          subject: 'Question about advanced signs',
          user: 'jane.smith@example.com',
          priority: 'low',
          status: 'resolved',
          createdAt: new Date(Date.now() - 172800000) // 2 days ago
        }
      ]);
    };

    const fetchForumPosts = async () => {
      // Mock forum posts data since the endpoint doesn't exist
      setForumPosts([
        {
          id: 1,
          title: 'Tips for learning sign language',
          author: 'signlearner123',
          status: 'approved',
          replies: 5,
          createdAt: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          id: 2,
          title: 'Best practices for teaching',
          author: 'teacher456',
          status: 'pending',
          replies: 2,
          createdAt: new Date(Date.now() - 7200000) // 2 hours ago
        }
      ]);
    };

    if (token) {
      fetchDashboardData();
      fetchContentItems();
      fetchUserStats();
      fetchPendingReviews();
      fetchUserQueries();
      fetchForumPosts();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // getContentTypeIcon unused

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-500';
      case 'draft': return 'text-yellow-500';
      case 'pending': return 'text-blue-500';
      case 'flagged': return 'text-red-500';
      case 'approved': return 'text-green-500';
      case 'open': return 'text-blue-500';
      case 'in_progress': return 'text-yellow-500';
      case 'resolved': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Content Management Functions
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload PNG, JPEG, GIF, or MP4 files only');
        return;
      }
      
      setUploadForm({
        ...uploadForm,
        file,
        filePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('category', uploadForm.category);
    formData.append('level', uploadForm.level);
    formData.append('file', uploadForm.file);

    try {
      const response = await fetch('http://localhost:5000/api/content/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newContent = await response.json();
        setContentItems([...contentItems, newContent.data]);
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          category: 'alphabet',
          level: 'beginner',
          file: null,
          filePreview: null
        });
      }
    } catch (error) {
      console.error('Error uploading content:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/content/${selectedContent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedContent = await response.json();
        setContentItems(contentItems.map(item => 
          item.id === selectedContent.id ? updatedContent.data : item
        ));
        setShowEditModal(false);
        setSelectedContent(null);
      }
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/content/${selectedContent.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setContentItems(contentItems.filter(item => item.id !== selectedContent.id));
        setShowDeleteModal(false);
        setSelectedContent(null);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  // handleDragEnd unused

  // User Support Functions
  const handleReply = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/support/tickets/${selectedQuery.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });

      if (response.ok) {
        setUserQueries(userQueries.map(query => 
          query.id === selectedQuery.id 
            ? { ...query, status: 'replied', reply: replyText }
            : query
        ));
        setShowReplyModal(false);
        setSelectedQuery(null);
        setReplyText('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  // Moderation Functions
  const handleModeratePost = async (postId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/support/forum/posts/${postId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setForumPosts(forumPosts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error moderating post:', error);
    }
  };

  const handleReportIssue = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/support/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          section: assignedSection,
          note: reportNote 
        })
      });

      if (response.ok) {
        setShowReportModal(false);
        setReportNote('');
        alert('Issue reported to Super Admin');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
    }
  };

  // Analytics Functions
  const exportAnalytics = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Category,Views,Completions,Success Rate\n" +
      // analyticsData.map(item => 
      //   `${item.category},${item.views},${item.completions},${item.successRate}%`
      // ).join("\n");
      "Category,Views,Completions,Success Rate\n" + // Placeholder for analytics data
      "Alphabet,1200,800,67%\n" +
      "Numbers,950,600,63%\n" +
      "Phrases,700,450,64%\n" +
      "Quizzes,500,300,60%"
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <ShieldCheckIcon className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-blue-500">ADMIN DASHBOARD</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">Content Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-8 h-8 text-gray-300" />
              <span className="font-semibold">{user?.name || 'Admin'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Full-width divider to visually extend under right header */}
      <div className={`w-full border-b ${border}`}></div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="w-full px-6">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Section Header */}
                <div className="bg-blue-500 text-white p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="w-6 h-6" />
                    <div>
                      <h1 className="text-sm font-medium">ADMIN CONTROL PANEL</h1>
                      <h2 className="text-xl font-bold">Content Management & Analytics</h2>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className={`flex space-x-1 mb-6 ${darkMode ? 'bg-[#1F2937]' : 'bg-gray-100'} rounded-lg p-1`}>
                  {[
                    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                    { id: 'content', label: 'Content Management', icon: DocumentTextIcon },
                    { id: 'support', label: 'User Support', icon: ChatBubbleLeftIcon },
                    { id: 'moderation', label: 'Forum Moderation', icon: FlagIcon },
                    { id: 'analytics', label: 'Section Analytics', icon: ChartPieIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? `${darkMode ? 'bg-[#111827] text-blue-400' : 'bg-white text-blue-500'} shadow-sm`
                          : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                                 {/* Overview Tab */}
                 {activeTab === 'overview' && (
                   <>
                     {/* Statistics Cards */}
                     {dashboardData && (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                         <div className={`p-6 rounded-lg border ${border} bg-gradient-to-r from-blue-500 to-blue-600 text-white`}>
                           <div className="flex items-center justify-between">
                             <div>
                              <p className="text-blue-100 text-sm">Total Users</p>
                               <p className="text-2xl font-bold">{totalUsersCount}</p>
                             </div>
                             <UsersIcon className="w-8 h-8 text-blue-200" />
                           </div>
                         </div>

                         <div className={`p-6 rounded-lg border ${border} bg-gradient-to-r from-green-500 to-green-600 text-white`}>
                           <div className="flex items-center justify-between">
                             <div>
                              <p className="text-green-100 text-sm">Active Users</p>
                               <p className="text-2xl font-bold">{activeUsersCount}</p>
                             </div>
                             <CheckCircleIcon className="w-8 h-8 text-green-200" />
                           </div>
                         </div>

                         <div className={`p-6 rounded-lg border ${border} bg-gradient-to-r from-purple-500 to-purple-600 text-white`}>
                           <div className="flex items-center justify-between">
                             <div>
                              <p className="text-purple-100 text-sm">Content Items</p>
                               <p className="text-2xl font-bold">{contentItemsCount}</p>
                             </div>
                             <DocumentTextIcon className="w-8 h-8 text-purple-200" />
                           </div>
                         </div>

                         <div className={`p-6 rounded-lg border ${border} bg-gradient-to-r from-yellow-500 to-yellow-600 text-white`}>
                           <div className="flex items-center justify-between">
                             <div>
                              <p className="text-yellow-100 text-sm">Pending Reviews</p>
                               <p className="text-2xl font-bold">{pendingReviewsCount}</p>
                             </div>
                             <ExclamationTriangleIcon className="w-8 h-8 text-yellow-200" />
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Content Management Section */}
                     <div className={`p-6 rounded-lg border ${border} mb-8`}>
                       <div className="flex items-center justify-between mb-6">
                         <h3 className="text-xl font-bold">Content Management</h3>
                         <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                           <PlusIcon className="w-5 h-5 inline mr-2" />
                           Add Content
                         </button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {/* Learning Modules */}
                         <div 
                           onClick={() => setActiveTab('content')}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                         >
                           <div className="flex items-center space-x-3 mb-3">
                             <AcademicCapIcon className="w-6 h-6 text-blue-500" />
                             <h4 className="font-semibold">Learning Modules</h4>
                           </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>Manage ISL lessons and learning paths</p>
                           <div className="flex justify-between text-sm">
                             <span>{contentItems.filter(item => item.type === 'lesson').length} modules</span>
                             <span className="text-green-500">Active</span>
                           </div>
                         </div>

                         {/* Dictionary */}
                         <div 
                           onClick={() => window.location.href = '/dictionary'}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                         >
                           <div className="flex items-center space-x-3 mb-3">
                             <BookOpenIcon className="w-6 h-6 text-green-500" />
                             <h4 className="font-semibold">Dictionary</h4>
                           </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>Update sign language dictionary</p>
                           <div className="flex justify-between text-sm">
                             <span>{contentItems.filter(item => item.type === 'image').length} signs</span>
                             <span className="text-green-500">Updated</span>
                           </div>
                         </div>

                         {/* Quizzes */}
                         <div 
                           onClick={() => window.location.href = '/quiz'}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                         >
                           <div className="flex items-center space-x-3 mb-3">
                             <PuzzlePieceIcon className="w-6 h-6 text-purple-500" />
                             <h4 className="font-semibold">Quizzes</h4>
                           </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>Create and manage assessments</p>
                           <div className="flex justify-between text-sm">
                             <span>{contentItems.filter(item => item.type === 'quiz').length} quizzes</span>
                             <span className="text-yellow-500">Active</span>
                           </div>
                         </div>

                         {/* Forum */}
                         <div 
                           onClick={() => setActiveTab('moderation')}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                         >
                           <div className="flex items-center space-x-3 mb-3">
                             <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-500" />
                             <h4 className="font-semibold">Forum</h4>
                           </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>Moderate community discussions</p>
                           <div className="flex justify-between text-sm">
                             <span>{forumPosts.length} posts</span>
                             <span className="text-red-500">Review</span>
                           </div>
                         </div>

                         {/* User Support */}
                         <div 
                           onClick={() => setActiveTab('support')}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                         >
                           <div className="flex items-center space-x-3 mb-3">
                             <ChatBubbleLeftIcon className="w-6 h-6 text-pink-500" />
                             <h4 className="font-semibold">User Support</h4>
                           </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>Handle user queries and tickets</p>
                           <div className="flex justify-between text-sm">
                             <span>{userQueries.filter(q => q.status === 'open').length} open</span>
                             <span className="text-blue-500">Active</span>
                           </div>
                         </div>

                         {/* Analytics */}
                         <div 
                           onClick={() => setActiveTab('analytics')}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                         >
                           <div className="flex items-center space-x-3 mb-3">
                             <ChartPieIcon className="w-6 h-6 text-red-500" />
                             <h4 className="font-semibold">Analytics</h4>
                           </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-3`}>View performance metrics</p>
                           <div className="flex justify-between text-sm">
                             <span>Reports</span>
                             <span className="text-green-500">Available</span>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Recent Activity & Analytics */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                       <div className={`p-6 rounded-lg border ${border} ${darkMode ? 'bg-transparent' : ''}`}>
                         <h3 className="text-xl font-bold mb-4 text-white">Recent Activity</h3>
                         <div className="space-y-4">
                          <div className={`flex items-center space-x-3 p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                             <div className="flex-1">
                              <p className="font-medium text-white">New lesson added</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Basic Hand Signs - 2 hours ago</p>
                             </div>
                           </div>
                          <div className={`flex items-center space-x-3 p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                             <div className="flex-1">
                              <p className="font-medium text-white">Dictionary updated</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Added 15 new signs - 4 hours ago</p>
                             </div>
                           </div>
                          <div className={`flex items-center space-x-3 p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                             <div className="flex-1">
                              <p className="font-medium text-white">Forum post flagged</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Requires moderation - 6 hours ago</p>
                             </div>
                           </div>
                          <div className={`flex items-center space-x-3 p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                             <div className="flex-1">
                              <p className="font-medium text-white">Quiz created</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Alphabet & Numbers - 1 day ago</p>
                             </div>
                           </div>
                         </div>
                       </div>

                       <div className={`p-6 rounded-lg border ${border} ${darkMode ? 'bg-transparent' : ''}`}>
                         <h3 className="text-xl font-bold mb-4 text-white">Content Analytics</h3>
                         <div className="space-y-4">
                          <div className={`flex justify-between items-center p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <span className={`${darkMode ? 'text-white' : ''}`}>Most Viewed Lesson</span>
                             <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>Basic Hand Signs</span>
                           </div>
                          <div className={`flex justify-between items-center p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <span className={`${darkMode ? 'text-white' : ''}`}>Popular Quiz</span>
                             <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>Alphabet Test</span>
                           </div>
                          <div className={`flex justify-between items-center p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <span className={`${darkMode ? 'text-white' : ''}`}>Active Discussions</span>
                             <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>23 topics</span>
                           </div>
                          <div className={`flex justify-between items-center p-3 ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'} rounded-lg`}>
                             <span className={`${darkMode ? 'text-white' : ''}`}>Content Completion</span>
                             <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>78%</span>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Quick Actions */}
                     <div className={`p-6 rounded-lg border ${border} mb-8`}>
                       <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className={`p-4 border rounded-lg ${darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'} transition-colors text-left`}>
                           <AcademicCapIcon className="w-6 h-6 text-blue-500 mb-2" />
                           <p className="font-semibold">Create Lesson</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Add new learning content</p>
                         </button>
                        <button className={`p-4 border rounded-lg ${darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'} transition-colors text-left`}>
                           <BookOpenIcon className="w-6 h-6 text-green-500 mb-2" />
                           <p className="font-semibold">Add Signs</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Update dictionary</p>
                         </button>
                        <button className={`p-4 border rounded-lg ${darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'} transition-colors text-left`}>
                           <PuzzlePieceIcon className="w-6 h-6 text-purple-500 mb-2" />
                           <p className="font-semibold">Create Quiz</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Build assessments</p>
                         </button>
                        <button className={`p-4 border rounded-lg ${darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'} transition-colors text-left`}>
                           <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-500 mb-2" />
                           <p className="font-semibold">Moderate Forum</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Review posts</p>
                         </button>
                       </div>
                     </div>
                   </>
                 )}

                {/* Content Management Tab */}
                {activeTab === 'content' && (
                  <ContentManagement />
                )}

                {/* User Support Tab */}
                {activeTab === 'support' && (
                  <div className={`p-6 rounded-lg border ${border} mb-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">User Support</h3>
                      <span className="text-sm text-gray-500">{userQueries.filter(q => q.status === 'open').length} open tickets</span>
                    </div>

                    <div className="space-y-4">
                      {userQueries.map((query) => (
                        <div key={query.id} className={`p-4 border ${border} rounded-lg`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold">{query.subject}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(query.priority)}`}>
                                  {query.priority}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(query.status)}`}>
                                  {query.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">From: {query.user}</p>
                              <p className="text-sm text-gray-500">Created: {query.createdAt.toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedQuery(query);
                                  setShowReplyModal(true);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                              >
                                Reply
                              </button>
                              <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                                Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forum Moderation Tab */}
                {activeTab === 'moderation' && (
                  <div className={`p-6 rounded-lg border ${border} mb-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Forum Moderation</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{forumPosts.filter(p => p.status === 'pending' || p.status === 'flagged').length} need review</span>
                        <button 
                          onClick={() => setShowReportModal(true)}
                          className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                        >
                          Report Issue
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {forumPosts.map((post) => (
                        <div key={post.id} className={`p-4 border ${border} rounded-lg`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold">{post.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)}`}>
                                  {post.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">By: {post.author}</p>
                              <p className="text-sm text-gray-500">{post.replies} replies • {post.createdAt.toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2">
                              {post.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleModeratePost(post.id, 'approve')}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                  >
                                    <CheckBadgeIcon className="w-4 h-4 inline mr-1" />
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleModeratePost(post.id, 'reject')}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                  >
                                    <XMarkIcon className="w-4 h-4 inline mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {post.status === 'flagged' && (
                                <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600">
                                  <FlagIcon className="w-4 h-4 inline mr-1" />
                                  Review
                                </button>
                              )}
                              <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                                <EyeIcon className="w-4 h-4 inline mr-1" />
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6 mb-8">
                    {/* Analytics Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Section Analytics</h3>
                      <button 
                        onClick={exportAnalytics}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Content Views Chart */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h4 className="text-lg font-bold mb-4">Content Views by Category</h4>
                        <div className="h-64">
                          <Bar
                            data={{
                              labels: ['Alphabet', 'Numbers', 'Phrases', 'Quizzes'],
                              datasets: [
                                {
                                  label: 'Views',
                                  data: [1250, 890, 650, 420],
                                  backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(16, 185, 129, 0.8)',
                                    'rgba(245, 158, 11, 0.8)',
                                    'rgba(239, 68, 68, 0.8)'
                                  ],
                                  borderColor: [
                                    'rgba(59, 130, 246, 1)',
                                    'rgba(16, 185, 129, 1)',
                                    'rgba(245, 158, 11, 1)',
                                    'rgba(239, 68, 68, 1)'
                                  ],
                                  borderWidth: 1
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Completion Rates Chart */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h4 className="text-lg font-bold mb-4">Completion Rates</h4>
                        <div className="h-64">
                          <Pie
                            data={{
                              labels: ['Completed', 'In Progress', 'Not Started'],
                              datasets: [
                                {
                                  data: [65, 25, 10],
                                  backgroundColor: [
                                    'rgba(16, 185, 129, 0.8)',
                                    'rgba(245, 158, 11, 0.8)',
                                    'rgba(239, 68, 68, 0.8)'
                                  ],
                                  borderColor: [
                                    'rgba(16, 185, 129, 1)',
                                    'rgba(245, 158, 11, 1)',
                                    'rgba(239, 68, 68, 1)'
                                  ],
                                  borderWidth: 2
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom'
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-lg border ${border} bg-gradient-to-r from-blue-500 to-blue-600 text-white`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">Total Views</p>
                            <p className="text-2xl font-bold">3,210</p>
                          </div>
                          <EyeIcon className="w-8 h-8 text-blue-200" />
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border ${border} bg-gradient-to-r from-green-500 to-green-600 text-white`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">Completions</p>
                            <p className="text-2xl font-bold">2,087</p>
                          </div>
                          <CheckCircleIcon className="w-8 h-8 text-green-200" />
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border ${border} bg-gradient-to-r from-yellow-500 to-yellow-600 text-white`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-100 text-sm">Success Rate</p>
                            <p className="text-2xl font-bold">65%</p>
                          </div>
                          <ChartPieIcon className="w-8 h-8 text-yellow-200" />
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border ${border} bg-gradient-to-r from-purple-500 to-purple-600 text-white`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">Avg. Time</p>
                            <p className="text-2xl font-bold">12m</p>
                          </div>
                          <ClockIcon className="w-8 h-8 text-purple-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                

                {/* Minimal Footer */}
                <div className="mt-12 mb-8">
                  <div className={`p-6 rounded-lg border ${border}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-white font-black text-sm">E</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-full animate-pulse"></div>
                            <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-[#00CC00]/20 rounded-full animate-ping"></div>
                          </div>
                          <span className="font-black text-lg text-[#00CC00]">EchoAid</span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          © 2024 EchoAid. All rights reserved.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Notifications & Support */}
              <div className="w-80 p-4 space-y-4">
                {/* Pending Reviews */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3">Pending Reviews</h4>
                  <div className="space-y-2 text-sm">
                    <div className={`p-2 rounded border ${darkMode ? 'bg-transparent border-yellow-600/40' : 'bg-yellow-50 border-yellow-200'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-yellow-800'}`}>Forum post flagged</p>
                      <p className={`${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>2 hours ago</p>
                    </div>
                    <div className={`p-2 rounded border ${darkMode ? 'bg-transparent border-blue-600/40' : 'bg-blue-50 border-blue-200'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-blue-800'}`}>New lesson submitted</p>
                      <p className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>4 hours ago</p>
                    </div>
                    <div className={`p-2 rounded border ${darkMode ? 'bg-transparent border-green-600/40' : 'bg-green-50 border-green-200'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-green-800'}`}>Quiz ready for review</p>
                      <p className={`${darkMode ? 'text-green-300' : 'text-green-600'}`}>1 day ago</p>
                    </div>
                  </div>
                </div>

                {/* Content Stats */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3">Content Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Lessons</span>
                      <span className="text-blue-400">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dictionary Entries</span>
                      <span className="text-green-400">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Quizzes</span>
                      <span className="text-purple-400">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Forum Topics</span>
                      <span className="text-orange-400">23</span>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3">System Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Content Server</span>
                      <span className="text-green-400">✓ Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Media Storage</span>
                      <span className="text-green-400">✓ Available</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database</span>
                      <span className="text-green-400">✓ Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CDN</span>
                      <span className="text-green-400">✓ Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>

      {/* Upload Content Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${bg} p-6 rounded-lg w-96 max-w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-xl font-bold mb-4">Upload New Content</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="alphabet">Alphabet</option>
                  <option value="numbers">Numbers</option>
                  <option value="phrases">Phrases</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={uploadForm.level}
                  onChange={(e) => setUploadForm({...uploadForm, level: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File Upload</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".png,.jpg,.jpeg,.gif,.mp4"
                  className="w-full p-2 border rounded"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB. Supported: PNG, JPEG, GIF, MP4
                </p>
              </div>
              {uploadForm.filePreview && (
                <div>
                  <label className="block text-sm font-medium mb-1">Preview</label>
                  {uploadForm.file?.type.startsWith('image/') ? (
                    <img 
                      src={uploadForm.filePreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded border"
                    />
                  ) : (
                    <video 
                      src={uploadForm.filePreview} 
                      controls 
                      className="w-32 h-32 object-cover rounded border"
                    />
                  )}
                </div>
              )}
            </form>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${bg} p-6 rounded-lg w-96 max-w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <h3 className="text-xl font-bold mb-4">Edit Content</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <ReactQuill
                  value={editForm.description}
                  onChange={(value) => setEditForm({...editForm, description: value})}
                  className="w-full"
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline'],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="alphabet">Alphabet</option>
                  <option value="numbers">Numbers</option>
                  <option value="phrases">Phrases</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={editForm.level}
                  onChange={(e) => setEditForm({...editForm, level: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </form>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${bg} p-6 rounded-lg w-96 max-w-full mx-4`}>
            <h3 className="text-xl font-bold mb-4">Delete Content</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedContent.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${bg} p-6 rounded-lg w-96 max-w-full mx-4`}>
            <h3 className="text-xl font-bold mb-4">Reply to Query</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Query: {selectedQuery.subject}</p>
              <p className="text-sm text-gray-500">{selectedQuery.message}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Enter your reply..."
              className="w-full p-2 border rounded h-32"
              required
            />
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${bg} p-6 rounded-lg w-96 max-w-full mx-4`}>
            <h3 className="text-xl font-bold mb-4">Report Issue to Super Admin</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Section: {assignedSection}</p>
            </div>
            <textarea
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full p-2 border rounded h-32"
              required
            />
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Scroll to Top Button */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 z-50"
          title="Scroll to top"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
} 