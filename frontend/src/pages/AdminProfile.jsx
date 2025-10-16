import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PencilIcon,
  PhotoIcon,
  XMarkIcon,
  KeyIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import { useSessionManager } from '../hooks/useSessionManager';

export default function AdminProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const fileInputRef = useRef(null);
  
  const { user, token, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const { 
    sessionInfo, 
    isRefreshing, 
    refreshSession, 
    formatTimeUntilExpiry 
  } = useSessionManager();

  // Theme variables - exactly like user profile
  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const statusBarBg = darkMode ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePhotoUpload = async (file) => {
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch('http://localhost:5000/api/auth/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update user context or refresh
        window.location.reload();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploadingPhoto(false);
      setShowPhotoOptions(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile/photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  const getProfilePhoto = () => {
    return user?.avatar && user.avatar.trim() !== '' ? user.avatar : null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle click outside photo options
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPhotoOptions && !event.target.closest('.photo-options-container')) {
        setShowPhotoOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhotoOptions]);

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar - Fixed */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* Admin Badge */}
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-400">Admin</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Session: {formatTimeUntilExpiry()}</span>
            </div>
            <TopBarUserAvatar />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="w-full mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Profile Header - Same as user profile */}
                <div className={`p-6 rounded-lg border ${border} mb-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="relative photo-options-container">
                        {getProfilePhoto() ? (
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600">
                            <img 
                              src={getProfilePhoto()} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center relative group">
                            <PlusIcon className="w-8 h-8 text-white" />
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Click to add photo
                            </div>
                          </div>
                        )}
                        
                        {/* Edit Photo Button */}
                        <button 
                          onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                          className="absolute -top-1 -right-1 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 text-white" />
                        </button>

                        {/* Photo Options Dropdown */}
                        {showPhotoOptions && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-10">
                            <div className="p-2">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPhoto}
                                className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded text-sm transition-colors"
                              >
                                <PhotoIcon className="w-4 h-4 text-white" />
                                <span className="text-white">{isUploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                              </button>
                              
                              {getProfilePhoto() && (
                                <button
                                  onClick={handleRemovePhoto}
                                  className="w-full flex items-center space-x-2 p-2 hover:bg-gray-700 rounded text-sm transition-colors text-red-400"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                  <span>Remove Photo</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handlePhotoUpload(file);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>{user?.name || 'Admin User'}</h1>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                      {user?.createdAt ? `Joined ${formatDate(user.createdAt)}` : 'Administrator Account'}
                    </p>
                    <p className="text-green-400 text-sm">✓ {user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}</p>
                    {getProfilePhoto() && (
                      <p className="text-purple-400 text-sm">📸 Custom profile photo</p>
                    )}
                  </div>
                </div>

                {/* Tab Navigation - Same as user profile */}
                <div className={`${cardBg} rounded-lg border ${border} mb-6`}>
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { id: 'overview', label: 'Overview', icon: UserCircleIcon },
                        { id: 'security', label: 'Security & Sessions', icon: ShieldCheckIcon },
                        { id: 'account', label: 'Account Settings', icon: Cog6ToothIcon }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                              ? 'border-green-500 text-green-600 dark:text-green-400'
                              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                          }`}
                        >
                          <tab.icon className="w-5 h-5" />
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Account Information */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Full Name</label>
                            <p className={`${textPrimary} font-medium`}>{user?.name || 'Not set'}</p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Email Address</label>
                            <p className={`${textPrimary} font-medium`}>{user?.email || 'Not set'}</p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Role</label>
                            <p className={`${textPrimary} font-medium`}>
                              {user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                            </p>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Account Created</label>
                            <p className={`${textPrimary} font-medium`}>
                              {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security & Sessions Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      {/* Security Settings */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <KeyIcon className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className={`font-medium ${textPrimary}`}>Two-Factor Authentication</p>
                                <p className={`text-sm ${textSecondary}`}>Add an extra layer of security</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                              Enable 2FA
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <BellIcon className="w-5 h-5 text-green-500" />
                              <div>
                                <p className={`font-medium ${textPrimary}`}>Login Notifications</p>
                                <p className={`text-sm ${textSecondary}`}>Get notified of new logins</p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm">
                              Configure
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Session Information */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Current Session</h2>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={textSecondary}>Session Status</span>
                            <span className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={textSecondary}>Expires In</span>
                            <span className={textPrimary}>{formatTimeUntilExpiry()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={textSecondary}>Device</span>
                            <span className={textPrimary}>
                              <ComputerDesktopIcon className="w-4 h-4 inline mr-1" />
                              Desktop
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={textSecondary}>Last Activity</span>
                            <span className={textPrimary}>Just now</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={refreshSession}
                            disabled={isRefreshing}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Session'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Settings Tab */}
                  {activeTab === 'account' && (
                    <div className="space-y-6">
                      {/* Edit Profile */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                        <form className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Full Name</label>
                              <input
                                type="text"
                                defaultValue={user?.name || ''}
                                className={`w-full px-3 py-2 border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${bg} ${textPrimary}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Email Address</label>
                              <input
                                type="email"
                                defaultValue={user?.email || ''}
                                className={`w-full px-3 py-2 border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${bg} ${textPrimary}`}
                              />
                            </div>
                          </div>
                          <div className="flex space-x-3 pt-4">
                            <button
                              type="button"
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}