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
  PlusIcon,
  QrCodeIcon,
  TrashIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import ThemeToggle from '../components/ThemeToggle';
import MessagesNotification from '../components/MessagesNotification';
import { useSessionManager } from '../hooks/useSessionManager';

export default function AdminProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [adminProfilePhoto, setAdminProfilePhoto] = useState(null);
  const fileInputRef = useRef(null);
  
  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  
  // Session management states
  const [userSessions, setUserSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState('');
  
  // Notification settings
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
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
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const sidebarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 2FA Functions
  const setup2FA = async () => {
    setIs2FALoading(true);
    setTwoFactorError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.qrCodeUrl);
        setTwoFactorSecret(data.secret);
        setShow2FASetup(true);
      } else {
        const error = await response.json();
        setTwoFactorError(error.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      setTwoFactorError('Network error. Please try again.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const enable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit code');
      return;
    }

    setIs2FALoading(true);
    setTwoFactorError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      });
      
      if (response.ok) {
        setTwoFactorEnabled(true);
        setShow2FASetup(false);
        setVerificationCode('');
        setQrCodeUrl('');
        setTwoFactorSecret('');
      } else {
        const error = await response.json();
        setTwoFactorError(error.message || 'Invalid verification code');
      }
    } catch (error) {
      setTwoFactorError('Network error. Please try again.');
    } finally {
      setIs2FALoading(false);
    }
  };

  const disable2FA = async () => {
    setIs2FALoading(true);
    setTwoFactorError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setTwoFactorEnabled(false);
      } else {
        const error = await response.json();
        setTwoFactorError(error.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      setTwoFactorError('Network error. Please try again.');
    } finally {
      setIs2FALoading(false);
    }
  };

  // Session Management Functions
  const fetchUserSessions = async () => {
    setIsLoadingSessions(true);
    setSessionError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserSessions(data.sessions || []);
      } else {
        setSessionError('Failed to load sessions');
      }
    } catch (error) {
      setSessionError('Network error. Please try again.');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setUserSessions(prev => prev.filter(session => session._id !== sessionId));
      }
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const revokeAllSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setUserSessions([]);
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error);
    }
  };

  const handlePhotoUpload = async (file) => {
    setIsUploadingPhoto(true);
    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setAdminProfilePhoto(previewUrl);
      
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
        // Update admin profile photo with the server response
        if (data.data && data.data.avatar) {
          setAdminProfilePhoto(data.data.avatar);
        }
      } else {
        // Revert on error
        setAdminProfilePhoto(null);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      // Revert on error
      setAdminProfilePhoto(null);
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
        // Clear admin profile photo
        setAdminProfilePhoto(null);
      }
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  const getProfilePhoto = () => {
    // Use admin-specific photo if available, otherwise use user avatar
    return adminProfilePhoto || (user?.avatar && user.avatar.trim() !== '' ? user.avatar : null);
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

  // Load initial data
  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
    fetchUserSessions();
  }, [user, token]);

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
            <MessagesNotification />
            <ThemeToggle />
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
                          {/* Two-Factor Authentication */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <KeyIcon className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className={`font-medium ${textPrimary}`}>Two-Factor Authentication</p>
                                <p className={`text-sm ${textSecondary}`}>
                                  {twoFactorEnabled ? 'Enabled - Your account is protected' : 'Add an extra layer of security'}
                                </p>
                                {twoFactorEnabled && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {twoFactorEnabled ? (
                                <button 
                                  onClick={disable2FA}
                                  disabled={is2FALoading}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                                >
                                  {is2FALoading ? 'Disabling...' : 'Disable 2FA'}
                                </button>
                              ) : (
                                <button 
                                  onClick={setup2FA}
                                  disabled={is2FALoading}
                                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                                >
                                  {is2FALoading ? 'Setting up...' : 'Enable 2FA'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 2FA Setup Modal */}
                          {show2FASetup && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className={`${cardBg} p-6 rounded-lg border ${border} max-w-md w-full mx-4`}>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className={`text-lg font-semibold ${textPrimary}`}>Setup Two-Factor Authentication</h3>
                                  <button 
                                    onClick={() => setShow2FASetup(false)}
                                    className={`${textSecondary} hover:${textPrimary}`}
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="text-center">
                                    <p className={`text-sm ${textSecondary} mb-3`}>
                                      Scan this QR code with your authenticator app:
                                    </p>
                                    {qrCodeUrl && (
                                      <div className="flex justify-center mb-4">
                                        <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                      </div>
                                    )}
                                    <p className={`text-xs ${textSecondary}`}>
                                      Or manually enter this secret: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{twoFactorSecret}</code>
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                                      Enter 6-digit code from your app:
                                    </label>
                                    <input
                                      type="text"
                                      value={verificationCode}
                                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                      className={`w-full px-3 py-2 border ${border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${bg} ${textPrimary}`}
                                      placeholder="123456"
                                      maxLength="6"
                                    />
                                  </div>
                                  
                                  {twoFactorError && (
                                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                                      <ExclamationCircleIcon className="w-4 h-4" />
                                      <span className="text-sm">{twoFactorError}</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => setShow2FASetup(false)}
                                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={enable2FA}
                                      disabled={is2FALoading || verificationCode.length !== 6}
                                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      {is2FALoading ? 'Verifying...' : 'Enable 2FA'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Login Notifications */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <BellIcon className="w-5 h-5 text-green-500" />
                              <div>
                                <p className={`font-medium ${textPrimary}`}>Login Notifications</p>
                                <p className={`text-sm ${textSecondary}`}>Get notified of new logins and security events</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={loginNotifications}
                                  onChange={(e) => setLoginNotifications(e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <span className={`text-sm ${textSecondary}`}>Enable</span>
                              </label>
                            </div>
                          </div>

                          {/* Email Notifications */}
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <BellIcon className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className={`font-medium ${textPrimary}`}>Email Notifications</p>
                                <p className={`text-sm ${textSecondary}`}>Receive security alerts via email</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={emailNotifications}
                                  onChange={(e) => setEmailNotifications(e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <span className={`text-sm ${textSecondary}`}>Enable</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Session Management */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold">Session Management</h2>
                          <button
                            onClick={fetchUserSessions}
                            disabled={isLoadingSessions}
                            className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                          >
                            <ArrowPathIcon className={`w-4 h-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                          </button>
                        </div>

                        {/* Current Session Info */}
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className={`font-semibold ${textPrimary} mb-3 flex items-center space-x-2`}>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Current Session</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                              <span className={textSecondary}>Status:</span>
                              <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={textSecondary}>Expires:</span>
                              <span className={textPrimary}>{formatTimeUntilExpiry()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={textSecondary}>Device:</span>
                              <span className={textPrimary}>
                                <ComputerDesktopIcon className="w-4 h-4 inline mr-1" />
                                Desktop
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={textSecondary}>Last Activity:</span>
                              <span className={textPrimary}>Just now</span>
                            </div>
                          </div>
                        </div>

                        {/* All Sessions */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`font-semibold ${textPrimary}`}>All Active Sessions</h3>
                            {userSessions.length > 1 && (
                              <button
                                onClick={revokeAllSessions}
                                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <TrashIcon className="w-4 h-4" />
                                <span>Revoke All</span>
                              </button>
                            )}
                          </div>

                          {isLoadingSessions ? (
                            <div className="flex items-center justify-center py-8">
                              <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
                              <span className={`ml-2 ${textSecondary}`}>Loading sessions...</span>
                            </div>
                          ) : sessionError ? (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 py-4">
                              <ExclamationCircleIcon className="w-5 h-5" />
                              <span>{sessionError}</span>
                            </div>
                          ) : userSessions.length === 0 ? (
                            <div className="text-center py-8">
                              <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className={textSecondary}>No active sessions found</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {userSessions.map((session, index) => (
                                <div key={session._id || index} className={`p-4 rounded-lg border ${border} ${session.isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-3 h-3 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <span className={`font-medium ${textPrimary}`}>
                                            {session.deviceInfo?.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                                          </span>
                                          {session.isActive && (
                                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                        <div className={`text-sm ${textSecondary}`}>
                                          {session.deviceInfo?.ipAddress && (
                                            <span>IP: {session.deviceInfo.ipAddress}</span>
                                          )}
                                          {session.deviceInfo?.userAgent && (
                                            <span className="ml-2">
                                              {session.deviceInfo.userAgent.includes('Chrome') ? 'Chrome' : 
                                               session.deviceInfo.userAgent.includes('Firefox') ? 'Firefox' : 
                                               session.deviceInfo.userAgent.includes('Safari') ? 'Safari' : 'Browser'}
                                            </span>
                                          )}
                                        </div>
                                        <div className={`text-xs ${textSecondary}`}>
                                          Last activity: {session.lastActivity ? formatDate(session.lastActivity) : 'Unknown'}
                                        </div>
                                      </div>
                                    </div>
                                    {!session.isActive && (
                                      <button
                                        onClick={() => revokeSession(session._id)}
                                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-1"
                                      >
                                        <TrashIcon className="w-3 h-3" />
                                        <span>Revoke</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Settings Tab */}
                  {activeTab === 'account' && (
                    <div className="space-y-6">
                      {/* Theme Settings */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Theme Settings</h2>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${textPrimary}`}>Appearance</p>
                              <p className={`text-sm ${textSecondary}`}>Choose your preferred theme</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm ${textSecondary}`}>
                                Use the theme toggle in the top status bar
                              </span>
                            </div>
                          </div>
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <p className={`text-sm ${textSecondary}`}>
                              Current theme: <span className="font-medium">{darkMode ? 'Dark' : 'Light'} mode</span>
                            </p>
                            <p className={`text-xs ${textSecondary} mt-1`}>
                              Theme preference is saved automatically and will be applied across all admin pages.
                              Use the theme toggle button in the top status bar to change themes.
                            </p>
                          </div>
                        </div>
                      </div>

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