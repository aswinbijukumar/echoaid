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
  EllipsisHorizontalIcon,
  ShieldCheckIcon,
  GiftIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Dashboard() {
  const [currentStreak] = useState(0);
  const [totalXP] = useState(1250);
  const [lives] = useState(5);
  const [currentSection] = useState(1);
  const [currentUnit] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      description: "Master ASL alphabet and counting",
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

  const dailyQuests = [
    { id: 1, title: "Complete 3 lessons", progress: 2, target: 3, xp: 50 },
    { id: 2, title: "Practice for 15 minutes", progress: 8, target: 15, xp: 30 },
    { id: 3, title: "Learn 5 new signs", progress: 3, target: 5, xp: 25 }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className="bg-[#1A1A1A] border-b border-gray-600 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Empty space on the left */}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">{currentStreak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{totalXP}</span>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-red-400" />
              <span className="font-semibold">{lives}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-8 h-8 text-gray-300" />
              <span className="font-semibold">{user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <div className="fixed left-0 top-0 h-screen w-64 bg-[#1A1A1A] z-50 pt-4">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <HandRaisedIcon className="w-6 h-6 text-green-400" />
              <span className="font-bold text-lg">EchoAid</span>
            </div>
            
            <nav className="space-y-2">
              <Link to="/dashboard" className="flex items-center space-x-3 p-3 bg-green-500 text-white rounded-lg">
                <AcademicCapIcon className="w-5 h-5" />
                <span className="font-semibold">LEARN</span>
              </Link>
              <Link to="/dictionary" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <BookOpenIcon className="w-5 h-5" />
                <span>DICTIONARY</span>
              </Link>
              <Link to="/forum" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>COMMUNITY</span>
              </Link>
              <Link to="/quiz" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <PuzzlePieceIcon className="w-5 h-5" />
                <span>QUIZ</span>
              </Link>
              <Link to="/accessibility" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <Cog6ToothIcon className="w-5 h-5" />
                <span>SETTINGS</span>
              </Link>
              <Link to="/leaderboard" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <ShieldCheckIcon className="w-5 h-5" />
                <span>LEADERBOARD</span>
              </Link>
              <Link to="/quests" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <GiftIcon className="w-5 h-5" />
                <span>QUESTS</span>
              </Link>
              <Link to="/shop" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <ShoppingBagIcon className="w-5 h-5" />
                <span>SHOP</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                <UserCircleIcon className="w-5 h-5" />
                <span>PROFILE</span>
              </Link>
              <div className="border-t border-gray-600 pt-2">
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors w-full"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                  <span>MORE</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content Area with Left Margin */}
        <div className="flex-1 ml-64 bg-[#1A1A1A]">
          <div className="max-w-6xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Section Header */}
                <div className="bg-green-500 text-white p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <Link to="/" className="text-white hover:text-gray-200">
                      <ArrowUpIcon className="w-5 h-5 rotate-90" />
                    </Link>
                    <div>
                      <h1 className="text-sm font-medium">SECTION {currentSection}, UNIT {currentUnit}</h1>
                      <h2 className="text-xl font-bold">Master Basic Hand Signs</h2>
                    </div>
                  </div>
                </div>

                {/* Learning Path */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    {learningModules.slice(0, 3).map((module) => (
                      <div
                        key={module.id}
                        className={`${cardBg} p-4 rounded-lg border ${border} cursor-pointer hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`${module.color} p-3 rounded-full`}>
                            <module.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            <p className="text-gray-400 text-sm">{module.description}</p>
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
                        className={`${cardBg} p-4 rounded-lg border ${border} cursor-pointer hover:shadow-lg transition-all ${
                          module.status === 'locked' ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`${module.color} p-3 rounded-full`}>
                            <module.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            <p className="text-gray-400 text-sm">{module.description}</p>
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

                {/* Daily Quests */}
                <div className={`${cardBg} p-6 rounded-lg border ${border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Daily Quests</h3>
                    <Link to="/quests" className="text-blue-400 hover:text-blue-300 text-sm">
                      VIEW ALL
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {dailyQuests.map((quest) => (
                      <div key={quest.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <SparklesIcon className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm">{quest.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">{quest.progress}/{quest.target}</span>
                          <span className="text-xs text-blue-400">+{quest.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimal Footer */}
                <div className="mt-12 mb-8">
                  <div className={`${cardBg} p-6 rounded-lg border ${border}`}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="flex items-center space-x-2">
                          <HandRaisedIcon className="w-5 h-5 text-green-400" />
                          <span className="font-semibold">EchoAid</span>
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

              {/* Right Sidebar - Promotions */}
              <div className="w-80 p-4 space-y-4">
                {/* Premium Promotion */}
                <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg mb-3">
                    <h3 className="font-bold text-lg">PRO PREMIUM</h3>
                  </div>
                  <h4 className="font-semibold mb-2">Unlock Advanced Features</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Get unlimited practice, advanced lessons, and personalized learning paths!
                  </p>
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                    TRY 7 DAYS FREE
                  </button>
                </div>

                {/* Community Stats */}
                <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3">Community Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Learners</span>
                      <span className="text-green-400">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Today</span>
                      <span className="text-blue-400">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Rank</span>
                      <span className="text-purple-400">#42</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link to="/dictionary" className="block w-full text-left p-2 hover:bg-gray-700 rounded transition-colors">
                      📚 Search Signs
                    </Link>
                    <Link to="/forum" className="block w-full text-left p-2 hover:bg-gray-700 rounded transition-colors">
                      💬 Join Discussion
                    </Link>
                    <Link to="/quiz" className="block w-full text-left p-2 hover:bg-gray-700 rounded transition-colors">
                      🧩 Take Quiz
                    </Link>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className={`${cardBg} p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3">Stay Updated</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Get the latest learning tips and community updates
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="w-full bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
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
