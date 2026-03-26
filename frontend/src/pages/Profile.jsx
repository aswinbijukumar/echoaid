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
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const fileInputRef = useRef(null);

  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { stats: userStats } = useUserStats();
  const {
    sessionInfo,
    isRefreshing,
    refreshSession,
    formatTimeUntilExpiry
  } = useSessionManager();

  // Theme variables - Match Learn, Quiz, Practice, and Dictionary pages exactly
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200';
  const glassEffect = darkMode ? 'bg-white/5 backdrop-blur-md border border-white/10' : 'bg-gray-100 border border-gray-200';
  const glassHover = darkMode ? 'hover:bg-white/10 hover:border-white/20' : 'hover:bg-gray-200 hover:border-gray-300';

  // Real achievements data - fetched from API
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
    completionRate: 0,
    totalXPEarned: 0
  });
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  // Real user statistics data
  const [userStatistics, setUserStatistics] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
    completedQuizzes: 0,
    completedPractices: 0,
    completedLessons: 0,
    badges: [],
    longestStreak: 0,
    joinDate: null,
    lastActivity: null
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch achievements data from API
  const fetchAchievements = async () => {
    try {
      setAchievementsLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAchievements(data.data.achievements);
          setAchievementStats(data.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  // Fetch comprehensive user statistics
  const fetchUserStatistics = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const ls = data.user.learningStats || {};
          setUserStatistics({
            streak: ls.streak || 0,
            totalXP: ls.totalXP || 0,
            level: ls.level || 1,
            xpToNextLevel: ls.xpToNextLevel || 100,
            completedQuizzes: ls.completedQuizzes || 0,
            completedPractices: ls.completedPractices || 0,
            completedLessons: ls.completedLessons || 0,
            badges: ls.badges || [],
            longestStreak: ls.longestStreak || 0,
            joinDate: data.user.createdAt,
            lastActivity: data.user.lastLogin
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch achievements when component mounts and when activeTab changes to achievements
  useEffect(() => {
    if (activeTab === 'achievements') {
      fetchAchievements();
    }
  }, [activeTab]);

  // Fetch user statistics when component mounts and when activeTab changes to overview
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchUserStatistics();
    }
  }, [activeTab]);

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
          const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/auth/profile-photo`, {
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
      const response = await fetch(`${'https://echoaidbackend.onrender.com'}/api/auth/profile-photo`, {
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
      {/* Fixed Top Status Bar - Match Learn, Quiz, Practice, and Dictionary pages exactly */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${statusBarBg} border-b ${border} px-6 py-3 pl-64`}>
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
              <span className="font-semibold">Rank {userStats.level}</span>
              <span className="text-sm text-gray-400">({userStats.xpToNextLevel} to next)</span>
            </div>
            <TopBarUserAvatar />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-300 dark:bg-gray-600 z-40"></div>

        {/* Main Content Area */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="w-full mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6 pt-20">
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
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>{user?.name || 'User'}</h1>
                    <p className={`${textSecondary} text-sm`}>Joined {userStats.joinedDate}</p>
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
                          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
                        {statsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Loading statistics...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <FireIcon className="w-5 h-5 text-orange-400" />
                                <span className="font-semibold">{userStatistics.streak} Day streak</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Longest: {userStatistics.longestStreak} days
                              </div>
                            </div>
                            <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <SparklesIcon className="w-5 h-5 text-blue-400" />
                                <span className="font-semibold">{userStatistics.totalXP} Total XP</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Rank {userStatistics.level} ({userStatistics.xpToNextLevel} to next)
                              </div>
                            </div>
                            <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <PuzzlePieceIcon className="w-5 h-5 text-purple-400" />
                                <span className="font-semibold">{userStatistics.completedQuizzes} Quizzes</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Completed quizzes
                              </div>
                            </div>
                            <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                              <div className="flex items-center space-x-2 mb-2">
                                <TrophyIcon className="w-5 h-5 text-yellow-400" />
                                <span className="font-semibold">{userStatistics.badges.length} Badges</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Achievements earned
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Activity Summary */}
                      <div className={`p-6 rounded-lg border ${border}`}>
                        <h2 className="text-xl font-bold mb-4">Activity Summary</h2>
                        {statsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Loading activity...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                              <div className="flex items-center space-x-3">
                                <AcademicCapIcon className="w-6 h-6 text-green-500" />
                                <div>
                                  <div className="font-semibold">{userStatistics.completedLessons}</div>
                                  <div className="text-sm text-gray-500">Lessons Completed</div>
                                </div>
                              </div>
                            </div>
                            <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                              <div className="flex items-center space-x-3">
                                <HandRaisedIcon className="w-6 h-6 text-blue-500" />
                                <div>
                                  <div className="font-semibold">{userStatistics.completedPractices}</div>
                                  <div className="text-sm text-gray-500">Practice Sessions</div>
                                </div>
                              </div>
                            </div>
                            <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                              <div className="flex items-center space-x-3">
                                <ClockIcon className="w-6 h-6 text-purple-500" />
                                <div>
                                  <div className="font-semibold">
                                    {userStatistics.joinDate ? new Date(userStatistics.joinDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500">Member Since</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
                      <div className={`${glassEffect} rounded-xl p-8 shadow-2xl`}>
                        <h2 className="text-3xl font-bold mb-4 text-white">Support & Messages</h2>
                        <p className={`text-lg ${textSecondary} mb-8`}>
                          Contact our support team for assistance with your account, learning progress, or any questions you may have.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Send Message Card */}
                          <div className={`${glassEffect} rounded-xl p-8 shadow-lg`}>
                            <div className="flex items-center space-x-4 mb-6">
                              <div className={`p-3 rounded-xl bg-blue-500/20 border border-blue-400/30`}>
                                <PlusIcon className="h-8 w-8 text-blue-400" />
                              </div>
                              <div>
                                <h3 className={`text-2xl font-bold ${textPrimary}`}>Send Message</h3>
                                <p className={`text-base ${textSecondary}`}>Contact support team</p>
                              </div>
                            </div>
                            <p className={`text-base ${textSecondary} mb-6`}>
                              Send a message to our support team for any questions, issues, or feedback.
                            </p>
                            <Link
                              to="/messages"
                              className="inline-flex items-center space-x-3 px-6 py-3 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-md border border-blue-400/30"
                            >
                              <ChatBubbleLeftRightIcon className="h-5 w-5" />
                              <span>Send Message</span>
                            </Link>
                          </div>

                          {/* View Messages Card */}
                          <div className={`${glassEffect} rounded-xl p-8 shadow-lg`}>
                            <div className="flex items-center space-x-4 mb-6">
                              <div className={`p-3 rounded-xl bg-green-500/20 border border-green-400/30`}>
                                <EyeIcon className="h-8 w-8 text-green-400" />
                              </div>
                              <div>
                                <h3 className={`text-2xl font-bold ${textPrimary}`}>Message History</h3>
                                <p className={`text-base ${textSecondary}`}>View your messages</p>
                              </div>
                            </div>
                            <p className={`text-base ${textSecondary} mb-6`}>
                              View your message history, replies from support, and track the status of your inquiries.
                            </p>
                            <Link
                              to="/messages"
                              className="inline-flex items-center space-x-3 px-6 py-3 bg-green-500/80 hover:bg-green-500 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-md border border-green-400/30"
                            >
                              <EyeIcon className="h-5 w-5" />
                              <span>View Messages</span>
                            </Link>
                          </div>
                        </div>

                        {/* Quick Help Section */}
                        <div className={`mt-8 ${glassEffect} rounded-xl p-8 shadow-lg`}>
                          <h3 className={`text-2xl font-bold ${textPrimary} mb-6`}>Quick Help</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-4">
                              <AcademicCapIcon className="h-8 w-8 text-blue-400" />
                              <div>
                                <p className={`text-lg font-semibold ${textPrimary}`}>Learning Issues</p>
                                <p className={`text-base ${textSecondary}`}>Problems with lessons or progress</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <CreditCardIcon className="h-8 w-8 text-green-400" />
                              <div>
                                <p className={`text-lg font-semibold ${textPrimary}`}>Billing & Subscription</p>
                                <p className={`text-base ${textSecondary}`}>Payment and subscription questions</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Cog6ToothIcon className="h-8 w-8 text-purple-400" />
                              <div>
                                <p className={`text-lg font-semibold ${textPrimary}`}>Technical Support</p>
                                <p className={`text-base ${textSecondary}`}>App bugs and technical issues</p>
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
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold">Your Achievements</h2>
                          {!achievementsLoading && (
                            <div className="text-sm text-gray-500">
                              {achievementStats.unlocked} of {achievementStats.total} unlocked
                            </div>
                          )}
                        </div>

                        {/* Achievement Stats */}
                        {!achievementsLoading && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className={`p-3 rounded-lg ${cardBg} border ${border}`}>
                              <div className="text-2xl font-bold text-blue-500">{achievementStats.total}</div>
                              <div className="text-sm text-gray-500">Total</div>
                            </div>
                            <div className={`p-3 rounded-lg ${cardBg} border ${border}`}>
                              <div className="text-2xl font-bold text-green-500">{achievementStats.unlocked}</div>
                              <div className="text-sm text-gray-500">Unlocked</div>
                            </div>
                            <div className={`p-3 rounded-lg ${cardBg} border ${border}`}>
                              <div className="text-2xl font-bold text-yellow-500">{achievementStats.completionRate}%</div>
                              <div className="text-sm text-gray-500">Complete</div>
                            </div>
                            <div className={`p-3 rounded-lg ${cardBg} border ${border}`}>
                              <div className="text-2xl font-bold text-purple-500">{achievementStats.totalXPEarned}</div>
                              <div className="text-sm text-gray-500">XP Earned</div>
                            </div>
                          </div>
                        )}

                        {/* Achievements Grid */}
                        {achievementsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Loading achievements...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {achievements.filter(a => a.visible).map((achievement) => (
                              <div
                                key={achievement.id}
                                className={`p-4 rounded-lg border transition-all duration-200 ${achievement.unlocked
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                                  : 'border-gray-300 dark:border-gray-600 opacity-60'
                                  }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-2xl">{achievement.icon}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <h3 className="font-semibold text-sm">{achievement.name}</h3>
                                      {achievement.unlocked && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                          ✓ Unlocked
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                                      {achievement.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className={`px-2 py-1 rounded-full ${achievement.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                                        achievement.rarity === 'epic' ? 'bg-blue-100 text-blue-800' :
                                          achievement.rarity === 'rare' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {achievement.rarity}
                                      </span>
                                      {achievement.xpReward > 0 && (
                                        <span className="text-yellow-600 font-medium">
                                          +{achievement.xpReward} XP
                                        </span>
                                      )}
                                    </div>
                                    {achievement.progress > 0 && achievement.progress < 100 && (
                                      <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                          <div
                                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${achievement.progress}%` }}
                                          ></div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {Math.round(achievement.progress)}% complete
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
