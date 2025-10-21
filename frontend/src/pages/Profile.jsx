import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  TrophyIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  HandRaisedIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  CalendarIcon,
  PhotoIcon,
  XMarkIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  KeyIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import Sidebar from '../components/Sidebar';
import { useUserStats } from '../hooks/useUserStats';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import SessionInstances from '../components/SessionInstances';
import SubscriptionStatus from '../components/SubscriptionStatus';
import { useSessionManager } from '../hooks/useSessionManager';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const fileInputRef = useRef(null);
  
  const { darkMode } = useTheme();
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { stats: userStats } = useUserStats();
  const { 
    sessionInfo, 
    isRefreshing, 
    refreshSession, 
    formatTimeUntilExpiry 
  } = useSessionManager();


  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const sidebarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // Mock user data - in real app, this would come from user context/API
  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first lesson", icon: "🎯", unlocked: true },
    { id: 2, title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", unlocked: true },
    { id: 3, title: "Sign Master", description: "Learn 100 signs", icon: "📚", unlocked: true },
    { id: 4, title: "Quiz Champion", description: "Score 90% on any quiz", icon: "🏆", unlocked: false },
    { id: 6, title: "Perfect Week", description: "Complete all daily goals for 7 days", icon: "⭐", unlocked: false }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Profile photo management functions
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoUrl = e.target.result;
        
                 try {
           // Send to backend
           const response = await fetch('http://localhost:5000/api/auth/profile-photo', {
             method: 'PUT',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
             },
             body: JSON.stringify({ photoUrl })
           });

           if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`HTTP ${response.status}: ${errorText}`);
           }
           
           const data = await response.json();
          
                     if (data.success) {
             // Update user context
             setUser(prev => ({ ...prev, avatar: data.data.avatar }));
             setShowPhotoOptions(false);
             alert(isGoogleUser() ? 'Profile photo updated successfully! Your Google photo has been replaced.' : 'Profile photo updated successfully!');
           } else {
             alert(data.message || 'Failed to update profile photo');
           }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          alert('Failed to upload photo. Please try again.');
        }
      };
      
      reader.onerror = () => {
        alert('Failed to read the image file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    const message = isGoogleUser() 
      ? 'Are you sure you want to remove your Google profile photo? You can always upload your own photo instead.'
      : 'Are you sure you want to remove your profile photo?';
    
    if (!confirm(message)) return;

         try {
       const response = await fetch('http://localhost:5000/api/auth/profile-photo', {
         method: 'DELETE',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
       });

       const data = await response.json();
      
             if (data.success) {
         // Update user context
         setUser(prev => ({ ...prev, avatar: '' }));
         setShowPhotoOptions(false);
         alert(isGoogleUser() ? 'Google profile photo removed successfully! You can now upload your own photo.' : 'Profile photo removed successfully!');
       } else {
         alert(data.message || 'Failed to remove profile photo');
       }
    } catch (error) {
      console.error('Remove photo error:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };

  const getProfilePhoto = () => {
    if (user?.avatar && user.avatar.trim() !== '') {
      return user.avatar;
    }
    return null;
  };

  const isGoogleUser = () => {
    return user?.googleId;
  };



  // Close photo options when clicking outside
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
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* Empty space on the left */}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">{userStats.streak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{userStats.totalXP} XP</span>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Lv {userStats.level}</span>
              <span className="text-sm text-gray-400">({userStats.xpToNextLevel} to next)</span>
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
                {/* Profile Header */}
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
                                  <span>{isGoogleUser() ? 'Remove Google Photo' : 'Remove Photo'}</span>
                                </button>
                              )}
                              
                              {isGoogleUser() && getProfilePhoto() && (
                                <div className="p-2 text-xs text-gray-400 border-t border-gray-600 mt-2">
                                  <p className="text-white">Currently using Google profile photo</p>
                                  <p className="text-yellow-400 mt-1">You can replace it with your own photo</p>
                                </div>
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
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>{user?.name || 'User'}</h1>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Joined {userStats.joinedDate}</p>
                     {isGoogleUser() && (
                       <p className="text-green-400 text-sm">✓ Google Account</p>
                     )}
                     {isGoogleUser() && getProfilePhoto() && (
                       <p className="text-blue-400 text-sm">📸 Using Google profile photo</p>
                     )}
                     {!isGoogleUser() && getProfilePhoto() && (
                       <p className="text-purple-400 text-sm">📸 Custom profile photo</p>
                     )}
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className={`${cardBg} rounded-lg border ${border} mb-6`}>
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { id: 'overview', label: 'Overview', icon: UserCircleIcon },
                        { id: 'security', label: 'Security & Sessions', icon: ShieldCheckIcon },
                        { id: 'subscription', label: 'Subscription', icon: CreditCardIcon },
                        { id: 'support', label: 'Support & Messages', icon: ChatBubbleLeftRightIcon },
                        { id: 'achievements', label: 'Achievements', icon: TrophyIcon }
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
                {/* Statistics Section */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Learning Statistics</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <FireIcon className="w-5 h-5 text-orange-400" />
                        <span className="font-semibold">{userStats.streak} Day streak</span>
                      </div>
                    </div>
                          <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">{userStats.totalXP} Total XP</span>
                      </div>
                    </div>
                          <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">{userStats.currentLeague}</span>
                      </div>
                    </div>
                          <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <TrophyIcon className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold">{userStats.top3Finishes} Top 3 finishes</span>
                      </div>
                    </div>
                  </div>
                </div>

                      {/* Quick Actions */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            onClick={() => navigate('/learn')}
                            className="flex items-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <AcademicCapIcon className="w-6 h-6" />
                            <span>Continue Learning</span>
                          </button>
                          <button
                            onClick={() => navigate('/quiz')}
                            className="flex items-center space-x-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          >
                            <PuzzlePieceIcon className="w-6 h-6" />
                            <span>Take a Quiz</span>
                          </button>
                          <button
                            onClick={() => navigate('/dictionary')}
                            className="flex items-center space-x-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <BookOpenIcon className="w-6 h-6" />
                            <span>Browse Dictionary</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security & Sessions Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      {/* Current Session Status */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Current Session</h2>
                        {sessionInfo ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${sessionInfo.isValid ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                  {sessionInfo.isValid ? (
                                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                  ) : (
                                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold">Session Status</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {sessionInfo.isValid ? 'Active and secure' : 'Expired or invalid'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={refreshSession}
                                disabled={isRefreshing}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                              >
                                {isRefreshing ? (
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ArrowPathIcon className="w-4 h-4" />
                                )}
                                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Session'}</span>
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <ClockIcon className="w-5 h-5 text-blue-500" />
                                  <span className="font-medium">Time Until Expiry</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">
                                  {formatTimeUntilExpiry(sessionInfo.timeUntilExpiry)}
                                </p>
                              </div>
                              <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <ComputerDesktopIcon className="w-5 h-5 text-green-500" />
                                  <span className="font-medium">Activity Status</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                  {sessionInfo.isActive ? 'Active' : 'Inactive'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Unable to load session information</p>
                          </div>
                        )}
                      </div>

                      {/* Active Sessions */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Active Sessions</h2>
                        <SessionInstances />
                      </div>
                    </div>
                  )}

                  {/* Subscription Tab */}
                  {activeTab === 'subscription' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold">Subscription & Billing</h2>
                          <button
                            onClick={() => navigate('/subscription')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Manage Subscription
                          </button>
                        </div>
                        <SubscriptionStatus />
                      </div>
                    </div>
                  )}

                  {/* Support & Messages Tab */}
                  {activeTab === 'support' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Support & Messages</h2>
                        <p className={`text-gray-600 dark:text-gray-400 mb-6`}>
                          Contact our support team for assistance with your account, learning progress, or any questions you may have.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Send Message Card */}
                          <div className={`p-6 rounded-lg border ${border} ${cardBg}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                                <PlusIcon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold ${text}`}>Send Message</h3>
                                <p className={`text-sm ${textSecondary}`}>Contact support team</p>
                              </div>
                            </div>
                            <p className={`text-sm ${textSecondary} mb-4`}>
                              Send a message to our support team for any questions, issues, or feedback.
                            </p>
                            <Link
                              to="/messages"
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4" />
                              <span>Send Message</span>
                            </Link>
                          </div>

                          {/* View Messages Card */}
                          <div className={`p-6 rounded-lg border ${border} ${cardBg}`}>
                            <div className="flex items-center space-x-3 mb-4">
                              <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100/50'}`}>
                                <EyeIcon className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold ${text}`}>Message History</h3>
                                <p className={`text-sm ${textSecondary}`}>View your messages</p>
                              </div>
                            </div>
                            <p className={`text-sm ${textSecondary} mb-4`}>
                              View your message history, replies from support, and track the status of your inquiries.
                            </p>
                            <Link
                              to="/messages"
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>View Messages</span>
                            </Link>
                          </div>
                        </div>

                        {/* Quick Help Section */}
                        <div className={`mt-8 p-6 rounded-lg border ${border} ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                          <h3 className={`text-lg font-semibold ${text} mb-3`}>Quick Help</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3">
                              <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className={`font-medium ${text}`}>Learning Issues</p>
                                <p className={`text-sm ${textSecondary}`}>Problems with lessons or progress</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CreditCardIcon className="h-5 w-5 text-green-500" />
                              <div>
                                <p className={`font-medium ${text}`}>Billing & Subscription</p>
                                <p className={`text-sm ${textSecondary}`}>Payment and subscription questions</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Cog6ToothIcon className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className={`font-medium ${text}`}>Technical Support</p>
                                <p className={`text-sm ${textSecondary}`}>App bugs and technical issues</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Achievements Tab */}
                  {activeTab === 'achievements' && (
                    <div className="space-y-6">
                  <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Your Achievements</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <div 
                          key={achievement.id} 
                              className={`p-4 rounded-lg border ${
                                achievement.unlocked 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                  : 'border-gray-300 dark:border-gray-600 opacity-50'
                              }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div>
                              <h3 className="font-semibold text-sm">{achievement.title}</h3>
                                  <p className="text-gray-600 dark:text-gray-400 text-xs">{achievement.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                        </div>
                    </div>
                  </div>
                )}
                </div>

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
                      <div className="flex items-center space-x-6 text-sm">
                        <Link to="/terms" className="text-gray-400 hover:text-green-400 transition-colors">
                          Terms
                        </Link>
                        <Link to="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">
                          Privacy
                        </Link>
                      </div>
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
    </div>
  );
} 