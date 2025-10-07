import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import Modal from '../components/Modal';
import ContentManagement from '../components/ContentManagement';
import AdminQuizManagement from '../components/AdminQuizManagement';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Quiz Analytics Section Component
const QuizAnalyticsSection = () => {
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchQuizAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/admin/quiz/dashboard/overview', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setQuizAnalytics(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching quiz analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 rounded-lg border border-gray-300 bg-transparent backdrop-blur-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-gray-300 bg-transparent backdrop-blur-sm">
      <h4 className="text-lg font-bold mb-4">Quiz Analytics</h4>
      
      {/* Quiz Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800">Total Quizzes</h5>
          <p className="text-2xl font-bold text-blue-600">{quizAnalytics?.overview?.totalQuizzes || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h5 className="text-sm font-medium text-green-800">Total Attempts</h5>
          <p className="text-2xl font-bold text-green-600">{quizAnalytics?.overview?.totalAttempts || 0}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h5 className="text-sm font-medium text-yellow-800">Average Score</h5>
          <p className="text-2xl font-bold text-yellow-600">{Math.round(quizAnalytics?.overview?.averageScore || 0)}%</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h5 className="text-sm font-medium text-purple-800">Active Quizzes</h5>
          <p className="text-2xl font-bold text-purple-600">{quizAnalytics?.overview?.activeQuizzes || 0}</p>
        </div>
      </div>

      {/* Category Performance Chart */}
      {quizAnalytics?.categoryStats && quizAnalytics.categoryStats.length > 0 && (
        <div className="mb-6">
          <h5 className="text-lg font-semibold mb-4">Performance by Category</h5>
          <div className="h-64">
            <Bar
              data={{
                labels: quizAnalytics.categoryStats.map(cat => cat._id),
                datasets: [
                  {
                    label: 'Average Score',
                    data: quizAnalytics.categoryStats.map(cat => Math.round(cat.avgScore || 0)),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
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
      )}

      {/* Top Performing Quizzes */}
      {quizAnalytics?.topQuizzes && quizAnalytics.topQuizzes.length > 0 && (
        <div>
          <h5 className="text-lg font-semibold mb-4">Top Performing Quizzes</h5>
          <div className="space-y-2">
            {quizAnalytics.topQuizzes.map((quiz, index) => (
              <div key={quiz._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{quiz.title}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round(quiz.avgScore || 0)}% avg • {quiz.totalAttempts} attempts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [contentItems, setContentItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuizManagement, setShowQuizManagement] = useState(false);
  
  // Section Assignment States
  const [assignedSection] = useState('alphabet');
  
  // Mock data states (for features not yet implemented)
  
  const [userQueries, setUserQueries] = useState([]);
  
  // Modal states for user queries
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportNote, setReportNote] = useState('');
  
  // Content management modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'alphabet',
    level: 'beginner',
    file: null,
    filePreview: null
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'alphabet',
    level: 'beginner'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Add Admin (Super Admin only)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({ name: '', email: '', password: '' });
  
  const fileInputRef = useRef(null);
  
  const { darkMode } = useTheme();
  const { logout, token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [contentItemsCount, setContentItemsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'content', 'users', 'analytics'].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // Default to overview when no tab parameter is present
      setActiveTab('overview');
    }
  }, [searchParams]);

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
          setDashboardData(data.data);
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

    

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (token) {
      fetchDashboardData();
      fetchContentItems();
      fetchUserStats();
      fetchPendingReviews();
      fetchUserQueries();
      
      fetchUsers();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Create Admin (Super Admin only)
  const handleAddAdminFormChange = (e) => {
    setAddAdminForm({ ...addAdminForm, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...addAdminForm, role: 'admin' })
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(prev => [data.data, ...prev]);
        setShowAddAdminModal(false);
        setAddAdminForm({ name: '', email: '', password: '' });
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Failed to create admin');
      }
    } catch (e) {
      console.error('Create admin failed', e);
      alert('Create admin failed');
    }
  };

  // Content Management Functions
  const getStatusIcon = (isActive) => {
    return isActive ? (
      <span className="text-green-500 flex items-center">
        <CheckCircleIcon className="w-4 h-4 mr-1" />
        Active
      </span>
    ) : (
      <span className="text-red-500 flex items-center">
        <XCircleIcon className="w-4 h-4 mr-1" />
        Inactive
      </span>
    );
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

  // Show quiz management component if selected
  if (showQuizManagement) {
    return (
      <div className={`min-h-screen ${bg} ${text}`}>
        <div className="flex">
          <Sidebar handleLogout={handleLogout} />
          <div className="flex-1 ml-64">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Management</h1>
                  <p className="text-gray-600 dark:text-gray-300">Create and manage quizzes</p>
                </div>
                <button
                  onClick={() => setShowQuizManagement(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
              <AdminQuizManagement />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar - fixed so it doesn't scroll horizontally */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 fixed top-0 left-0 right-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <ShieldCheckIcon className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-blue-500">ADMIN DASHBOARD</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <TopBarUserAvatar size={8} showName={false} />
          </div>
        </div>
      </div>

      {/* Spacer to offset fixed top bar height */}
      <div className="h-[52px]"></div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="w-full px-6">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Dynamic Section Header based on active tab */}
                <div className="mb-6">
                  {activeTab === 'overview' && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ChartBarIcon className="w-8 h-8" />
                        <div>
                          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                          <p className="text-blue-100">System statistics and quick actions</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'content' && (
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="w-8 h-8" />
                        <div>
                          <h1 className="text-2xl font-bold">Sign Management</h1>
                          <p className="text-green-100">Manage sign language dictionary entries</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'users' && (
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UsersIcon className="w-8 h-8" />
                        <div>
                          <h1 className="text-2xl font-bold">User Management</h1>
                          <p className="text-purple-100">Manage user accounts and permissions</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'analytics' && (
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ChartPieIcon className="w-8 h-8" />
                        <div>
                          <h1 className="text-2xl font-bold">Section Analytics</h1>
                          <p className="text-orange-100">View performance and usage data</p>
                        </div>
                      </div>
                    </div>
                  )}
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
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'content' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                           tabIndex={0}
                           role="button"
                           aria-pressed={activeTab === 'content'}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                               e.preventDefault();
                               setActiveTab('content');
                             }
                           }}
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
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02]`}
                           tabIndex={0}
                           role="button"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                               e.preventDefault();
                               window.location.href = '/dictionary';
                             }
                           }}
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
                           onClick={() => setShowQuizManagement(true)}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02]`}
                           tabIndex={0}
                           role="button"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                               e.preventDefault();
                               setShowQuizManagement(true);
                             }
                           }}
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

                

                         {/* User Support */}
                         <div 
                           onClick={() => setActiveTab('support')}
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'support' ? 'ring-2 ring-pink-500 bg-pink-50 dark:bg-pink-900/20' : ''}`}
                           tabIndex={0}
                           role="button"
                           aria-pressed={activeTab === 'support'}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                               e.preventDefault();
                               setActiveTab('support');
                             }
                           }}
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
                           className={`p-4 rounded-lg border ${border} hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'analytics' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                           tabIndex={0}
                           role="button"
                           aria-pressed={activeTab === 'analytics'}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                               e.preventDefault();
                               setActiveTab('analytics');
                             }
                           }}
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
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button 
                          onClick={() => setActiveTab('content')}
                          className={`p-4 border rounded-lg transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'content' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'}`}
                          tabIndex={0}
                          aria-pressed={activeTab === 'content'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveTab('content');
                            }
                          }}
                        >
                           <DocumentTextIcon className="w-6 h-6 text-blue-500 mb-2" />
                           <p className="font-semibold">Manage Signs</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>View and edit sign language content</p>
                         </button>
                        <button 
                          onClick={() => setActiveTab('users')}
                          className={`p-4 border rounded-lg transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'users' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'}`}
                          tabIndex={0}
                          aria-pressed={activeTab === 'users'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveTab('users');
                            }
                          }}
                        >
                           <UsersIcon className="w-6 h-6 text-green-500 mb-2" />
                           <p className="font-semibold">Manage Users</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Add and manage users in your section</p>
                         </button>
                        <button 
                          onClick={() => setActiveTab('analytics')}
                          className={`p-4 border rounded-lg transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'analytics' ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'}`}
                          tabIndex={0}
                          aria-pressed={activeTab === 'analytics'}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveTab('analytics');
                            }
                          }}
                        >
                           <ChartPieIcon className="w-6 h-6 text-purple-500 mb-2" />
                           <p className="font-semibold">View Analytics</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Check section performance</p>
                         </button>
                       </div>
                     </div>
                   </>
                 )}

                {/* Content Management Tab */}
                {activeTab === 'content' && (
                  <ContentManagement />
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && (
                  <div className={`p-6 rounded-lg border ${border} mb-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">User Management</h3>
                      {currentUser?.role === 'super_admin' && (
                        <button
                          onClick={() => setShowAddAdminModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Add Admin
                        </button>
                      )}
                    </div>

                    {/* Current Admin Info */}
                    {currentUser && (
                      <div className={`mb-4 p-4 rounded-lg border ${border}`}>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span><span className="font-semibold">You:</span> {currentUser.name || currentUser.email}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">{currentUser.role?.replace('_', ' ') || 'user'}</span>
                          {currentUser.userCode && (
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">ID: {currentUser.userCode}</span>
                          )}
                          <span className="text-gray-500">Email: {currentUser.email}</span>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${border}`}>
                            <th className="text-left py-3 px-4">User</th>
                            <th className="text-left py-3 px-4">User Code</th>
                            <th className="text-left py-3 px-4">Role</th>
                            <th className="text-left py-3 px-4">Assigned Sections</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Last Login</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((userItem) => (
                            <tr key={userItem._id} className={`border-b ${border} hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-800' : ''}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold">
                                      {userItem.name ? userItem.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold">{userItem.name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-500">{userItem.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{userItem.userCode || '—'}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                  {(userItem.role || 'user').replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {(userItem.assignedSections || []).map(section => (
                                    <span key={section} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                      {section}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {getStatusIcon(userItem.isActive)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {userItem.lastLogin ? new Date(userItem.lastLogin).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="py-3 px-4">
                                {(() => {
                                  const isSelf = currentUser && currentUser._id === userItem._id;
                                  const isTargetSuper = userItem.role === 'super_admin';
                                  const canAdminDelete = currentUser?.role === 'admin' && userItem.role === 'user';
                                  const canSuperDelete = currentUser?.role === 'super_admin' && (userItem.role === 'user' || userItem.role === 'admin');
                                  const canDelete = !isSelf && !isTargetSuper && (canAdminDelete || canSuperDelete);

                                  const handleDeleteUser = async () => {
                                    if (!canDelete) return;
                                    if (!confirm(`Soft delete ${userItem.name || userItem.email}?`)) return;
                                    try {
                                      const res = await fetch(`http://localhost:5000/api/admin/users/${userItem._id}`, {
                                        method: 'DELETE',
                                        headers: {
                                          'Authorization': `Bearer ${token}`,
                                          'If-Updated-At': userItem.updatedAt || ''
                                        }
                                      });
                                      const data = await res.json().catch(() => ({}));
                                      if (!res.ok) {
                                        alert(data.message || 'Failed to delete user');
                                        return;
                                      }
                                      // Optimistically remove from list
                                      setUsers(prev => prev.filter(u => u._id !== userItem._id));
                                    } catch (e) {
                                      console.error('Delete failed', e);
                                      alert('Delete failed');
                                    }
                                  };

                                  return (
                                    <button
                                      onClick={handleDeleteUser}
                                      disabled={!canDelete}
                                      className={`inline-flex items-center px-3 py-1 rounded text-sm ${canDelete ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                      title={canDelete ? 'Soft delete user' : 'Action not allowed'}
                                    >
                                      <TrashIcon className="w-4 h-4 mr-1" /> Delete
                                    </button>
                                  );
                                })()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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

                    {/* Quiz Analytics Section */}
                    <QuizAnalyticsSection />

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

              {/* Right Sidebar removed to maximize main table space */}
            </div>
          </div>
        </div>

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>

      {/* Upload Content Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload New Content"
          className={`${bg}`}
        >
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
        </Modal>
      )}

      {/* Edit Content Modal */}
      {showEditModal && selectedContent && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Content"
          className={`${bg}`}
        >
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
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContent && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Content"
          className={`${bg}`}
        >
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
        </Modal>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedQuery && (
        <Modal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          title="Reply to Query"
          className={`${bg}`}
        >
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
        </Modal>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Report Issue to Super Admin"
          className={`${bg}`}
        >
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
        </Modal>
      )}

      {/* Add Admin Modal (Super Admin only) */}
      {showAddAdminModal && currentUser?.role === 'super_admin' && (
        <Modal
          isOpen={showAddAdminModal}
          onClose={() => setShowAddAdminModal(false)}
          title="Add New Admin"
          className={`${bg}`}
        >
          <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={addAdminForm.name}
                  onChange={handleAddAdminFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={addAdminForm.email}
                  onChange={handleAddAdminFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temporary Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  name="password"
                  value={addAdminForm.password}
                  onChange={handleAddAdminFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
          </form>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setShowAddAdminModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAdmin}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create Admin
            </button>
          </div>
        </Modal>
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