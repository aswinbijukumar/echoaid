import { useState, useEffect } from 'react';
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
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  EllipsisHorizontalIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  KeyIcon,
  ServerIcon,
  ArchiveBoxIcon,
  ClockIcon,
  UserPlusIcon,
  UserMinusIcon,
  ShieldExclamationIcon,
  CogIcon,
  ChartPieIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  CloudIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import TopBarUserAvatar from '../components/TopBarUserAvatar';

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [contentQueue, setContentQueue] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ name: '', role: 'user', isActive: true });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  
  const { darkMode } = useTheme();
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  const totalUsersCount = users && users.length ? users.length : (dashboardData?.stats?.totalUsers || 0);
  const activeUsersCount = users && users.length ? users.filter(u => u.isActive).length : (dashboardData?.stats?.activeUsers || 0);

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
        const response = await fetch('http://localhost:5000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
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

    const fetchAdmins = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/admins', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAdmins(data.data);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };

    const fetchContentQueue = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/content/queue', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setContentQueue(data.data);
        }
      } catch (error) {
        console.error('Error fetching content queue:', error);
      }
    };

    const fetchSecurityLogs = async () => {
      try {
        // Mock security logs - replace with actual API call
        setSecurityLogs([
          {
            id: 1,
            type: 'login_attempt',
            user: 'user@example.com',
            ip: '192.168.1.100',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            status: 'success'
          },
          {
            id: 2,
            type: 'role_change',
            user: 'admin@echoaid.com',
            changedBy: 'super_admin@echoaid.com',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            details: 'Role changed from user to admin'
          },
          {
            id: 3,
            type: 'content_upload',
            user: 'content@echoaid.com',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            details: 'Uploaded 15 new sign images'
          }
        ]);
      } catch (error) {
        console.error('Error fetching security logs:', error);
      }
    };

    if (token) {
      fetchDashboardData();
      fetchUsers();
      fetchAdmins();
      fetchContentQueue();
      fetchSecurityLogs();
      setLoading(false);
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUserUpdate = async (userId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedUsers = users.map(u => 
          u._id === userId ? { ...u, ...updates } : u
        );
        setUsers(updatedUsers);
        setShowUserModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleUserDelete = async (userId) => {
    // Prevent deletion of current user
    if (userId === user?._id) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setUsers(users.filter(user => user._id !== userId));
          alert('User deleted successfully');
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Super admin creates admins only
      const response = await fetch('http://localhost:5000/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...addUserForm, role: 'admin' })
      });

      if (response.ok) {
        const data = await response.json();
        // When a new admin is created, refresh admins list
        setAdmins([...admins, data.data]);
        setShowAddUserModal(false);
        setAddUserForm({ name: '', email: '', password: '', role: 'admin' });
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const openAddAdmin = () => {
    setAddUserForm({ name: '', email: '', password: '', role: 'admin' });
    setShowAddUserModal(true); // reuse the same modal UI for admin creation
  };

  const handleAddUserFormChange = (e) => {
    setAddUserForm({
      ...addUserForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContentApproval = async (contentId, approved) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/content/queue/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          approved,
          feedback: approved ? 'Content approved' : 'Content rejected'
        })
      });
      
      if (response.ok) {
        setContentQueue(contentQueue.filter(item => item.id !== contentId));
      }
    } catch (error) {
      console.error('Error updating content status:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500';
      case 'admin': return 'bg-blue-500';
      case 'user': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircleIcon className="w-5 h-5 text-green-500" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-red-500" />
    );
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <VideoCameraIcon className="w-5 h-5 text-red-500" />;
      case 'image': return <PhotoIcon className="w-5 h-5 text-blue-500" />;
      case 'lesson': return <AcademicCapIcon className="w-5 h-5 text-green-500" />;
      default: return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
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
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <ShieldCheckIcon className="w-6 h-6 text-red-500" />
            <span className="font-bold text-red-500">SUPER ADMIN DASHBOARD</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <TopBarUserAvatar size={8} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Section Header */}
                <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="w-6 h-6" />
                    <div>
                      <h1 className="text-sm font-medium">Super Admin</h1>
                      <h2 className="text-xl font-bold">Admin Console</h2>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className={`flex space-x-1 mb-6 ${darkMode ? 'bg-[#1F2937]' : 'bg-gray-100'} rounded-lg p-1`}>
                  {[
                    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                    { id: 'system', label: 'System Settings', icon: Cog6ToothIcon },
                    { id: 'security', label: 'Security & Logs', icon: ShieldExclamationIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? `${darkMode ? 'bg-[#111827] text-red-400' : 'bg-white text-red-500'} shadow-sm`
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

                        <div className={`p-6 rounded-lg border ${border} bg-gradient-to-r from-yellow-500 to-yellow-600 text-white`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-100 text-sm">Pending Content</p>
                              <p className="text-2xl font-bold">{contentQueue.length}</p>
                            </div>
                            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-200" />
                          </div>
                        </div>

                        <div className={`p-6 rounded-lg border ${border} bg-gradient-to-r from-purple-500 to-purple-600 text-white`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-100 text-sm">System Health</p>
                              <p className="text-2xl font-bold">98%</p>
                            </div>
                            <ServerIcon className="w-8 h-8 text-purple-200" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <button 
                            onClick={() => navigate('/admin?tab=users')}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'admins' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'}`}
                            tabIndex={0}
                            aria-pressed={activeTab === 'admins'}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/admin?tab=users');
                              }
                            }}
                          >
                            <UserPlusIcon className="w-5 h-5 inline mr-2" />
                            Manage Users & Admins
                          </button>
                          <button
                            onClick={openAddAdmin}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'}`}
                          >
                            <UserPlusIcon className="w-5 h-5 inline mr-2" />
                            Add Admin
                          </button>
                          <button 
                            onClick={() => navigate('/admin?tab=users')}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'users' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'}`}
                            tabIndex={0}
                            aria-pressed={activeTab === 'users'}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate('/admin?tab=users');
                              }
                            }}
                          >
                            <UserGroupIcon className="w-5 h-5 inline mr-2" />
                            Open User Management
                          </button>
                          <button 
                            onClick={() => setActiveTab('system')}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 hover:transform hover:scale-[1.02] focus:transform focus:scale-[1.02] ${activeTab === 'system' ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : darkMode ? 'hover:bg-[#1F2937]' : 'hover:bg-gray-50'}`}
                            tabIndex={0}
                            aria-pressed={activeTab === 'system'}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveTab('system');
                              }
                            }}
                          >
                            <CogIcon className="w-5 h-5 inline mr-2" />
                            System Settings
                          </button>
                        </div>
                      </div>

                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h3 className="text-xl font-bold mb-4">System Status</h3>
                        <div className="space-y-4">
                          <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                            <span className={`${darkMode ? 'text-white' : ''}`}>Database</span>
                            <span className="text-green-500">✓ Connected</span>
                          </div>
                          <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                            <span className={`${darkMode ? 'text-white' : ''}`}>Email Service</span>
                            <span className="text-green-500">✓ Active</span>
                          </div>
                          <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                            <span className={`${darkMode ? 'text-white' : ''}`}>File Storage</span>
                            <span className="text-green-500">✓ Online</span>
                          </div>
                          <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                            <span className={`${darkMode ? 'text-white' : ''}`}>API Status</span>
                            <span className="text-green-500">✓ Healthy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Combined User Management Tab */}
                {activeTab === 'user_mgmt' && (
                  <div className="space-y-6 mb-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">User Management</h3>
                      <button 
                        onClick={() => setShowAddUserModal(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <PlusIcon className="w-5 h-5 inline mr-2" />
                        Add User
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Admins Column */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold">Admins</h4>
                          <span className="text-sm text-gray-500">{admins.length} total</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${border}`}>
                                <th className="text-left py-3 px-4">Admin</th>
                                <th className="text-left py-3 px-4">Admin Code</th>
                                <th className="text-left py-3 px-4">Role</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {admins.map((adminItem) => (
                                <tr key={adminItem._id} className={`border-b ${border} hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-800' : ''}`}>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold">
                                          {adminItem.name ? adminItem.name.charAt(0).toUpperCase() : 'A'}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-semibold">{adminItem.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-500">{adminItem.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">{adminItem.userCode || '—'}</td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor(adminItem.role)}`}>
                                      {adminItem.role.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">{getStatusIcon(adminItem.isActive)}</td>
                                  <td className="py-3 px-4">
                                    {(() => {
                                      const isSelf = user && user._id === adminItem._id;
                                      const isTargetSuper = adminItem.role === 'super_admin';
                                      const canDelete = !isSelf && !isTargetSuper;
                                      const handleDeleteAdmin = async () => {
                                        if (!canDelete) return;
                                        if (!confirm(`Soft delete admin ${adminItem.name || adminItem.email}?`)) return;
                                        try {
                                          const res = await fetch(`http://localhost:5000/api/admin/admins/${adminItem._id}`, {
                                            method: 'DELETE',
                                            headers: {
                                              'Authorization': `Bearer ${token}`,
                                              'If-Updated-At': adminItem.updatedAt || ''
                                            }
                                          });
                                          const data = await res.json().catch(() => ({}));
                                          if (!res.ok) {
                                            alert(data.message || 'Failed to delete admin');
                                            return;
                                          }
                                          setAdmins(prev => prev.filter(a => a._id !== adminItem._id));
                                        } catch (e) {
                                          console.error('Delete admin failed', e);
                                          alert('Delete failed');
                                        }
                                      };
                                      return (
                                        <button
                                          onClick={handleDeleteAdmin}
                                          disabled={!canDelete}
                                          className={`inline-flex items-center px-3 py-1 rounded text-sm ${canDelete ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                          title={canDelete ? 'Soft delete admin' : 'Action not allowed'}
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

                      {/* Users Column */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold">Users</h4>
                          <span className="text-sm text-gray-500">{users.length} total</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${border}`}>
                                <th className="text-left py-3 px-4">User</th>
                                <th className="text-left py-3 px-4">User Code</th>
                                <th className="text-left py-3 px-4">Role</th>
                                <th className="text-left py-3 px-4">Status</th>
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
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor(userItem.role)}`}>
                                      {userItem.role.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">{getStatusIcon(userItem.isActive)}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => {
                                          setSelectedUser(userItem);
                                          setEditUserForm({ name: userItem.name || '', role: userItem.role, isActive: userItem.isActive });
                                          setShowUserModal(true);
                                        }}
                                        className="p-1 hover:bg-gray-200 rounded"
                                      >
                                        <PencilIcon className="w-4 h-4" />
                                      </button>
                                      {(() => {
                                        const isSelf = userItem._id === user?._id;
                                        const isTargetSuper = userItem.role === 'super_admin';
                                        const canDelete = !isSelf && !isTargetSuper;
                                        const onClick = () => handleUserDelete(userItem._id);
                                        return (
                                          <button
                                            onClick={onClick}
                                            disabled={!canDelete}
                                            className={`p-1 rounded ${canDelete ? 'hover:bg-red-100 text-red-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            title={canDelete ? 'Delete user' : 'Action not allowed'}
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </button>
                                        );
                                      })()}
                                      {userItem._id === user?._id && (
                                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">Current User</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Oversight Tab */}
                {activeTab === 'content' && (
                  <div className={`p-6 rounded-lg border ${border} mb-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Content Approval Queue</h3>
                      <span className="text-sm text-gray-500">{contentQueue.length} items pending</span>
                    </div>

                    <div className="space-y-4">
                      {contentQueue.map((content) => (
                        <div key={content.id} className={`p-4 border ${border} rounded-lg`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getContentTypeIcon(content.type)}
                              <div>
                                <h4 className="font-semibold">{content.title}</h4>
                                <p className="text-sm text-gray-500">
                                  Submitted by {content.submittedBy} • {content.submittedAt.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleContentApproval(content.id, true)}
                                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleContentApproval(content.id, false)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                              >
                                Reject
                              </button>
                              <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className={`p-6 rounded-lg border ${border}`}>
                      <h3 className="text-xl font-bold mb-4">Site Configuration</h3>
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>Theme Colors</span>
                          <div className="flex space-x-2">
                            <div className="w-6 h-6 bg-[#00CC00] rounded"></div>
                            <div className="w-6 h-6 bg-[#FFC107] rounded"></div>
                            <div className="w-6 h-6 bg-[#4285F4] rounded"></div>
                          </div>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>Font Family</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>Lato</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>Email Verification</span>
                          <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Enabled</button>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>User Registration</span>
                          <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">Open</button>
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg border ${border}`}>
                      <h3 className="text-xl font-bold mb-4">Usage Limits</h3>
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>Free Users</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>5 lessons/day</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>Premium Users</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>Unlimited</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>File Upload Limit</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>10MB</span>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                          <span className={`${darkMode ? 'text-white' : ''}`}>API Rate Limit</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : ''}`}>1000 req/hour</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security & Backup Tab */}
                {activeTab === 'security' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className={`p-6 rounded-lg border ${border}`}>
                      <h3 className="text-xl font-bold mb-4">Security Logs</h3>
                      <div className="space-y-3">
                        {securityLogs.map((log) => (
                          <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{log.type.replace('_', ' ').toUpperCase()}</p>
                                <p className="text-sm text-gray-500">{log.user}</p>
                                {log.details && <p className="text-sm text-gray-600">{log.details}</p>}
                              </div>
                              <span className="text-xs text-gray-400">
                                {log.timestamp.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg border ${border}`}>
                      <h3 className="text-xl font-bold mb-4">Backup & Maintenance</h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
                          <ArchiveBoxIcon className="w-5 h-5 inline mr-2" />
                          Create Database Backup
                        </button>
                        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
                          <CloudIcon className="w-5 h-5 inline mr-2" />
                          Backup Media Files
                        </button>
                        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
                          <WrenchScrewdriverIcon className="w-5 h-5 inline mr-2" />
                          System Maintenance
                        </button>
                        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border">
                          <DatabaseIcon className="w-5 h-5 inline mr-2" />
                          Optimize Database
                        </button>
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

              {/* Right Sidebar - Analytics */}
              <div className="w-80 p-4 space-y-4">
                {/* System Health */}
                <div className={`p-4 rounded-lg border ${border} ${darkMode ? 'bg-transparent' : ''}`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : ''}`}>System Health</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-white' : ''}`}>Database</span>
                      <span className="text-green-400">✓ Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-white' : ''}`}>Email Service</span>
                      <span className="text-green-400">✓ Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-white' : ''}`}>File Storage</span>
                      <span className="text-green-400">✓ Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-white' : ''}`}>API Status</span>
                      <span className="text-green-400">✓ Healthy</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`p-4 rounded-lg border ${border} ${darkMode ? 'bg-transparent' : ''}`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : ''}`}>Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className={`p-2 rounded ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>New user registered</p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>2 minutes ago</p>
                    </div>
                    <div className={`p-2 rounded ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>Content updated</p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>15 minutes ago</p>
                    </div>
                    <div className={`p-2 rounded ${darkMode ? 'bg-transparent border ' + border : 'bg-gray-50'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>System backup completed</p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>1 hour ago</p>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                <div className={`p-4 rounded-lg border ${border} ${darkMode ? 'bg-transparent' : ''}`}>
                  <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : ''}`}>Alerts</h4>
                  <div className="space-y-2">
                    <div className={`p-2 rounded border ${darkMode ? 'bg-transparent border-yellow-600/40' : 'bg-yellow-50 border-yellow-200'}`}>
                      <p className={`${darkMode ? 'text-yellow-300' : 'text-yellow-800'} text-sm`}>3 users pending verification</p>
                    </div>
                    <div className={`p-2 rounded border ${darkMode ? 'bg-transparent border-blue-600/40' : 'bg-blue-50 border-blue-200'}`}>
                      <p className={`${darkMode ? 'text-blue-300' : 'text-blue-800'} text-sm`}>System update available</p>
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

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title="Edit User"
          className={`${bg}`}
        >
          <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editUserForm.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.value === 'active' })}
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setShowUserModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUserUpdate(selectedUser._id, { role: editUserForm.role, isActive: editUserForm.isActive })}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <Modal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          title="Add New User"
          className={`${bg}`}
        >
          <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={addUserForm.name}
                  onChange={handleAddUserFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={addUserForm.email}
                  onChange={handleAddUserFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={addUserForm.password}
                  onChange={handleAddUserFormChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Role locked to Admin for Super Admin creation */}
          </form>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add User
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