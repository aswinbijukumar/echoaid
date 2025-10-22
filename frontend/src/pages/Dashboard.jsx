import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrophyIcon, 
  AcademicCapIcon, 
  HandRaisedIcon, 
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  FireIcon,
  HeartIcon,
  SparklesIcon,
  StarIcon,
  PlusIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useUserStats } from '../hooks/useUserStats';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import SubscriptionStatus from '../components/SubscriptionStatus';
import SubscriptionLimits from '../components/SubscriptionLimits';
import UnitSelector from '../components/UnitSelector';
import LessonViewer from '../components/LessonViewer';
import UserMessageForm from '../components/UserMessageForm';
import DailyStreak from '../components/DailyStreak';
import StreakNotification from '../components/StreakNotification';
import { streakService } from '../services/streakService';

export default function Dashboard() {
  const { stats: userStats } = useUserStats();
  const [currentSection] = useState(1);
  const [currentUnit] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [categories, setCategories] = useState([]);
  const [recentSigns, setRecentSigns] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'curriculum', 'lesson'
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showStreakNotification, setShowStreakNotification] = useState(false);
  const [streakNotificationData, setStreakNotificationData] = useState(null);
  const [previousStreak, setPreviousStreak] = useState(0);
  
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Function to fetch skills data
  const fetchSkillsData = useCallback(async () => {
    try {
      const skillsResponse = await fetch(`${API_BASE_URL}/api/skills`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const skillsData = await skillsResponse.json();
      
      if (skillsData.success && skillsData.data) {
        console.log('Fetched learning modules:', skillsData.data);
        // Update learning modules with real data
        setLearningModules(skillsData.data.map(skill => ({
          id: skill._id,
          title: skill.title,
          description: skill.description,
          icon: getSkillIcon(skill.category),
          progress: skill.progress || 0,
          color: getSkillColor(skill.category),
          status: getSkillStatus(skill),
          level: skill.level,
          isUnlocked: skill.isUnlocked,
          isCompleted: skill.isCompleted
        })));
      }
    } catch (error) {
      console.error('Error fetching skills data:', error);
    }
  }, [API_BASE_URL]);

  // Check for streak milestones and show notifications
  useEffect(() => {
    if (userStats && userStats.streak !== undefined) {
      const currentStreak = userStats.streak || 0;
      
      // Check for new milestone
      const milestone = streakService.checkMilestone(currentStreak, previousStreak);
      if (milestone) {
        setStreakNotificationData({
          type: 'milestone',
          title: milestone.title,
          message: milestone.message,
          streak: currentStreak,
          progress: streakService.getStreakProgress(currentStreak)
        });
        setShowStreakNotification(true);
      }
      
      // Update previous streak for next comparison
      setPreviousStreak(currentStreak);
    }
  }, [userStats, previousStreak]);

  // Handle streak message from DailyStreak component
  const handleStreakMessage = (message) => {
    if (message && !showStreakNotification) {
      setStreakNotificationData({
        type: 'daily',
        message: message,
        streak: userStats?.streak || 0
      });
      setShowStreakNotification(true);
    }
  };

  // Close streak notification
  const handleCloseStreakNotification = () => {
    setShowStreakNotification(false);
    setStreakNotificationData(null);
  };

  // Fetch categories, recent signs, and learning modules
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/content/categories`);
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success && categoriesData.data) {
          // Transform database categories to match expected format
          const transformedCategories = categoriesData.data.map(cat => ({
            id: cat.slug,
            name: cat.name,
            count: cat.signCount || 0,
            color: cat.color,
            description: cat.description
          }));
          setCategories(transformedCategories);
        }

        // Fetch recent signs
        const signsResponse = await fetch(`${API_BASE_URL}/api/dictionary/db/signs?limit=6`);
        const signsData = await signsResponse.json();
        
        if (signsData.signs && signsData.signs.length > 0) {
          setRecentSigns(signsData.signs);
        }

        // Fetch learning modules/skills
        await fetchSkillsData();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  // Refresh skills data when user returns from learning modules
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to the page, refresh skills data
        console.log('User returned to dashboard, refreshing skills...');
        fetchSkillsData();
      }
    };

    const handleFocus = () => {
      // User focused on the page, refresh skills data
      console.log('User focused on dashboard, refreshing skills...');
      fetchSkillsData();
    };

    const handleModuleCompleted = (event) => {
      // Module was completed, refresh skills data
      console.log('Dashboard received moduleCompleted event:', event.detail);
      console.log('Refreshing skills data...');
      fetchSkillsData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('moduleCompleted', handleModuleCompleted);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('moduleCompleted', handleModuleCompleted);
    };
  }, [fetchSkillsData]);

  // Helper functions for skill display
  const getSkillIcon = (category) => {
    const iconMap = {
      'basics': HandRaisedIcon,
      'alphabet': AcademicCapIcon,
      'numbers': AcademicCapIcon,
      'phrases': ChatBubbleLeftRightIcon,
      'family': UserCircleIcon,
      'activities': BookOpenIcon,
      'advanced': PuzzlePieceIcon
    };
    return iconMap[category] || BookOpenIcon;
  };

  const getSkillColor = (category) => {
    const colorMap = {
      'basics': 'bg-green-500',
      'alphabet': 'bg-blue-500',
      'numbers': 'bg-blue-500',
      'phrases': 'bg-purple-500',
      'family': 'bg-pink-500',
      'activities': 'bg-orange-500',
      'advanced': 'bg-red-500'
    };
    return colorMap[category] || 'bg-gray-500';
  };

  const getSkillStatus = (skill) => {
    if (skill.isCompleted) return 'completed';
    if (skill.isUnlocked) return 'available';
    return 'locked';
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Category icons mapping
  const categoryIcons = {
    alphabet: { icon: AcademicCapIcon, color: 'bg-blue-500' },
    numbers: { icon: AcademicCapIcon, color: 'bg-teal-500' },
    phrases: { icon: ChatBubbleLeftRightIcon, color: 'bg-purple-500' },
    family: { icon: UserCircleIcon, color: 'bg-pink-500' },
    activities: { icon: BookOpenIcon, color: 'bg-orange-500' },
    advanced: { icon: PuzzlePieceIcon, color: 'bg-red-500' }
  };

  // Learning modules will be populated from API


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Curriculum navigation handlers
  const handleCurriculumClick = () => {
    setCurrentView('curriculum');
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setCurrentView('lesson');
  };

  const handleBackToCurriculum = () => {
    setCurrentView('curriculum');
    setSelectedUnit(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedUnit(null);
  };

  // Manual refresh function for testing
  const handleRefreshSkills = () => {
    console.log('Manual refresh triggered...');
    fetchSkillsData();
  };

  const handleLessonComplete = (data) => {
    console.log('Lesson completed:', data);
    // Show completion notification
    alert(`Lesson completed! You earned ${data.xpEarned} XP. ${data.leveledUp ? 'Level up!' : ''}`);
    handleBackToCurriculum();
  };

  // Show loading screen while data is being fetched or user is not loaded
  if (loading || !userStats) {
    return (
      <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
        {/* Top Status Bar */}
        <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              {/* Empty space on the left */}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMessageForm(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Send Message to Support"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">Support</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-400"></div>
                <span className="font-semibold">Loading...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Fixed Left Sidebar - Navigation */}
          <Sidebar handleLogout={handleLogout} />

          {/* Main Content Area with Left Margin */}
          <div className={`flex-1 ml-64 ${bg} overflow-hidden`}>
            <div className="max-w-6xl mx-auto min-h-0">
              <div className="flex min-h-0">
                {/* Main Content */}
                <div className="flex-1 p-6">
                  {/* Support Section - Always Visible */}
                  <div className={`${cardBg} rounded-lg border ${border} p-6 mb-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                          <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${textPrimary}`}>Need Help?</h3>
                          <p className={`text-sm ${textSecondary}`}>Contact our support team for assistance</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          to="/support"
                          className={`px-4 py-2 ${cardBg} border ${border} rounded-lg ${text} ${hoverBg} transition-all duration-200 flex items-center space-x-2`}
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Messages</span>
                        </Link>
                        <button
                          onClick={() => setShowMessageForm(true)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
                        >
                          <PlusIcon className="h-4 w-4" />
                          <span>Send Message</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Loading Message */}
                  <div className={`${cardBg} rounded-lg border ${border} p-6 text-center`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00CC00] mx-auto mb-4"></div>
                    <p className={`text-lg ${textPrimary}`}>Loading your dashboard...</p>
                    <p className={`text-sm ${textSecondary} mt-2`}>Please wait while we fetch your learning progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form Modal */}
        {showMessageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <UserMessageForm
                onMessageSent={() => setShowMessageForm(false)}
                onClose={() => setShowMessageForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* Empty space on the left */}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMessageForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              title="Send Message to Support"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Support</span>
            </button>
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
            <TopBarUserAvatar size={8} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg} overflow-hidden`}>
          <div className="max-w-6xl mx-auto min-h-0">
            <div className="flex min-h-0">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Section Header */}
                <div className="bg-green-500 text-white p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Link to="/" className="text-white hover:text-gray-200">
                        <ArrowUpIcon className="w-5 h-5 rotate-90" />
                      </Link>
                      <div>
                        <h1 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>SECTION {currentSection}, UNIT {currentUnit}</h1>
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Master Basic Hand Signs</h2>
                      </div>
                    </div>
                    <button
                      onClick={handleCurriculumClick}
                      className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 font-semibold"
                    >
                      Start Learning Path
                    </button>
                  </div>
                </div>

                {/* Subscription Status */}
                <div className="mb-6">
                  <SubscriptionStatus />
                </div>

                {/* Subscription Limits (for trial users) */}
                <div className="mb-6">
                  <SubscriptionLimits />
                </div>

                {/* Daily Streak Component */}
                <div className="mb-6">
                  <DailyStreak 
                    userStats={userStats} 
                    onStreakMessage={handleStreakMessage}
                  />
                </div>

                {/* Support Section */}
                <div className={`${cardBg} rounded-lg border ${border} p-6 mb-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100/50'}`}>
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${textPrimary}`}>Need Help?</h3>
                        <p className={`text-sm ${textSecondary}`}>Contact our support team for assistance</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to="/support"
                        className={`px-4 py-2 ${cardBg} border ${border} rounded-lg ${text} ${hoverBg} transition-all duration-200 flex items-center space-x-2`}
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View Messages</span>
                      </Link>
                      <button
                        onClick={() => setShowMessageForm(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Send Message</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Learning Path */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold ${textPrimary}`}>Learning Path</h2>
                    <button
                      onClick={handleRefreshSkills}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    {learningModules.slice(0, 3).map((module) => {
                      const IconComponent = module.icon;
                      return (
                        <div
                          key={module.id}
                          className={`p-4 rounded-lg border ${border} cursor-pointer hover:shadow-lg transition-all ${
                            module.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => {
                            if (module.status !== 'locked') {
                              // Navigate to learning module
                              navigate(`/learn?module=${module.id}`);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`${module.color} p-3 rounded-full`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{module.title}</h3>
                              <p className={`text-gray-400 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{module.description}</p>
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{module.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`${module.color} h-2 rounded-full transition-all duration-300`}
                                    style={{ width: `${module.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            {module.status === 'completed' && (
                              <TrophyIcon className="w-6 h-6 text-yellow-400" />
                            )}
                            {module.status === 'locked' && (
                              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">🔒</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    {learningModules.slice(3, 6).map((module) => {
                      const IconComponent = module.icon;
                      return (
                        <div
                          key={module.id}
                          className={`p-4 rounded-lg border ${border} cursor-pointer hover:shadow-lg transition-all ${
                            module.status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => {
                            if (module.status !== 'locked') {
                              // Navigate to learning module
                              navigate(`/learn?module=${module.id}`);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`${module.color} p-3 rounded-full`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{module.title}</h3>
                              <p className={`text-gray-400 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{module.description}</p>
                              {module.status === 'locked' ? (
                                <div className="mt-2">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Locked</span>
                                    <span>Complete previous modules</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{module.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`${module.color} h-2 rounded-full transition-all duration-300`}
                                      style={{ width: `${module.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {module.status === 'completed' && (
                              <TrophyIcon className="w-6 h-6 text-yellow-400" />
                            )}
                            {module.status === 'locked' && (
                              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">🔒</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sign Language Categories */}
                <div className={`p-6 rounded-lg border ${border} mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Sign Language Categories</h3>
                    <Link to="/dictionary" className="text-blue-400 hover:text-blue-300 text-sm">
                      VIEW ALL
                    </Link>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {categories.map((category) => {
                        const iconData = categoryIcons[category.id] || { icon: HandRaisedIcon, color: 'bg-gray-500' };
                        const categoryColor = category.color || iconData.color;
                        return (
                          <Link
                            key={category.id}
                            to={`/dictionary?category=${category.id}`}
                            className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
                              `${cardBg} ${border} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-[#23272F]'}`
                            }`}
                          >
                            <div className="text-center">
                              <div className={`${categoryColor} p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center`}>
                                <iconData.icon className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold text-sm mb-1">{category.name}</h4>
                              <p className="text-xs text-gray-500 mb-2">{category.description}</p>
                              <span className="text-xs text-gray-400">{category.count} signs</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent Signs */}
                <div className={`p-6 rounded-lg border ${border} mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Recent Signs</h3>
                    <Link to="/dictionary" className="text-blue-400 hover:text-blue-300 text-sm">
                      VIEW ALL
                    </Link>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : recentSigns.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {recentSigns.map((sign) => {
                        const iconData = categoryIcons[sign.category] || { icon: HandRaisedIcon, color: 'bg-gray-500' };
                        const categoryColor = categories.find(cat => cat.id === sign.category)?.color || iconData.color;
                        return (
                          <Link
                            key={sign.id}
                            to={`/dictionary?category=${sign.category}`}
                            className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
                              `${cardBg} ${border} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${darkMode ? 'text-white' : 'text-[#23272F]'}`
                            }`}
                          >
                            <div className="text-center">
                              <div className={`${categoryColor} p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center`}>
                                <iconData.icon className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold text-sm mb-1">{sign.word}</h4>
                              <p className="text-xs text-gray-500 mb-2">{sign.description}</p>
                              <span className="text-xs text-gray-400 capitalize">{sign.category}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HandRaisedIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No signs available yet</p>
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
                        <Link to="/about" className="text-gray-400 hover:text-green-400 transition-colors">
                          About
                        </Link>
                        <Link to="/blog" className="text-gray-400 hover:text-green-400 transition-colors">
                          Blog
                        </Link>
                        <Link to="/store" className="text-gray-400 hover:text-green-400 transition-colors">
                          Store
                        </Link>
                        <Link to="/efficacy" className="text-gray-400 hover:text-green-400 transition-colors">
                          Efficacy
                        </Link>
                        <Link to="/careers" className="text-gray-400 hover:text-green-400 transition-colors">
                          Careers
                        </Link>
                        <Link to="/investors" className="text-gray-400 hover:text-green-400 transition-colors">
                          Investors
                        </Link>
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

              {/* Right Sidebar removed to maximize main content space */}
            </div>
          </div>
        </div>

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>

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

      {/* Curriculum Views */}
      {currentView === 'curriculum' && (
        <UnitSelector
          onUnitSelect={handleUnitSelect}
          onBack={handleBackToDashboard}
        />
      )}

      {currentView === 'lesson' && selectedUnit && (
        <LessonViewer
          unit={selectedUnit}
          onBack={handleBackToCurriculum}
          onLessonComplete={handleLessonComplete}
        />
      )}

      {/* Message Form Modal */}
      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <UserMessageForm
              onMessageSent={() => setShowMessageForm(false)}
              onClose={() => setShowMessageForm(false)}
            />
          </div>
        </div>
      )}

      {/* Streak Notification */}
      <StreakNotification
        isVisible={showStreakNotification}
        onClose={handleCloseStreakNotification}
        streakData={streakNotificationData}
        type={streakNotificationData?.type || 'daily'}
      />

    </div>
  );
}
