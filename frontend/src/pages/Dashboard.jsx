import { useState } from 'react';
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
  StarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useUserStats } from '../hooks/useUserStats';
import TopBarUserAvatar from '../components/TopBarUserAvatar';

export default function Dashboard() {
  const { stats: userStats } = useUserStats();
  const [currentSection] = useState(1);
  const [currentUnit] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [categories, setCategories] = useState([]);
  const [recentSigns, setRecentSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch categories and recent signs
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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

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

  // Sign Language Learning Modules
  const learningModules = [
    {
      id: 1,
      title: "Basic Hand Signs",
      description: "Learn fundamental hand gestures",
      icon: HandRaisedIcon,
      progress: 80,
      color: "bg-green-500",
      status: "completed"
    },
    {
      id: 2,
      title: "Alphabet & Numbers",
              description: "Master ISL alphabet and counting",
      icon: AcademicCapIcon,
      progress: 60,
      color: "bg-blue-500",
      status: "in-progress"
    },
    {
      id: 3,
      title: "Common Phrases",
      description: "Essential everyday expressions",
      icon: ChatBubbleLeftRightIcon,
      progress: 30,
      color: "bg-purple-500",
      status: "locked"
    },
    {
      id: 4,
      title: "Family & Friends",
      description: "Signs for relationships",
      icon: UserCircleIcon,
      progress: 0,
      color: "bg-pink-500",
      status: "locked"
    },
    {
      id: 5,
      title: "Daily Activities",
      description: "Routine and activities",
      icon: BookOpenIcon,
      progress: 0,
      color: "bg-orange-500",
      status: "locked"
    },
    {
      id: 6,
      title: "Advanced Conversations",
      description: "Complex communication skills",
      icon: PuzzlePieceIcon,
      progress: 0,
      color: "bg-red-500",
      status: "locked"
    }
  ];


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
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
                  <div className="flex items-center space-x-3">
                    <Link to="/" className="text-white hover:text-gray-200">
                      <ArrowUpIcon className="w-5 h-5 rotate-90" />
                    </Link>
                    <div>
                      <h1 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>SECTION {currentSection}, UNIT {currentUnit}</h1>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>Master Basic Hand Signs</h2>
                    </div>
                  </div>
                </div>

                {/* Learning Path */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    {learningModules.slice(0, 3).map((module) => (
                      <div
                        key={module.id}
                        className={`p-4 rounded-lg border ${border} cursor-pointer hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`${module.color} p-3 rounded-full`}>
                            <module.icon className="w-6 h-6 text-white" />
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
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {learningModules.slice(3, 6).map((module) => (
                      <div
                        key={module.id}
                        className={`p-4 rounded-lg border ${border} cursor-pointer hover:shadow-lg transition-all ${
                          module.status === 'locked' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`${module.color} p-3 rounded-full`}>
                            <module.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            <p className={`text-gray-400 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{module.description}</p>
                            {module.status === 'locked' && (
                              <div className="mt-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Locked</span>
                                  <span>Complete previous modules</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                              </div>
                            )}
                          </div>
                          {module.status === 'locked' && (
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">🔒</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
    </div>
  );
}
