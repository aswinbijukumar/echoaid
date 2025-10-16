import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { useUserStats } from '../hooks/useUserStats';
import { API_BASE_URL } from '../constants/api';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import SkillTree from '../components/SkillTree';
import LessonModal from '../components/LessonModal';
import {
  AcademicCapIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  BoltIcon,
  ClockIcon,
  HandRaisedIcon,
  UserCircleIcon,
  BookOpenIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

export default function Learn() {
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const { stats: userStats } = useUserStats();
  const navigate = useNavigate();

  // State management for Learning Path
  const [learningPath, setLearningPath] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyGoal, setDailyGoal] = useState({ completed: 0, target: 5 });
  const [streakInfo, setStreakInfo] = useState({ days: 0, frozen: false });

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  useEffect(() => {
    fetchLearningPath();
    fetchUserProgress();
  }, []);

  // Update progress when userStats changes
  useEffect(() => {
    if (userStats && Object.keys(userStats).length > 0) {
      fetchUserProgress();
    }
  }, [userStats]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first, fallback to mock data
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/api/curriculum/skills`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setLearningPath(data.data);
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
      }
      
      // Fallback to mock learning path data (Duolingo-style)
      const mockLearningPath = [
        {
          _id: '1',
          title: "Basics",
          description: "Essential greetings and polite expressions",
          category: "basics",
          order: 1,
          level: 0,
          isCompleted: false,
          isUnlocked: true,
          progress: 0,
          xpReward: 50,
          lessons: [
            { 
              id: 1, 
              title: "Hello & Goodbye", 
              completed: false, 
          xpReward: 20,
              signs: [
                {
                  word: "Hello",
                  coverImage: "/api/dictionary/signs/phrases/hello.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/phrases/hello_front.png", angle: "front" },
                    { type: "image", path: "/api/dictionary/signs/phrases/hello_side.png", angle: "side" },
                    { type: "video", path: "/api/dictionary/signs/phrases/hello_demo.mp4", angle: "demo" }
                  ]
                },
                {
                  word: "Goodbye",
                  coverImage: "/api/dictionary/signs/phrases/goodbye.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/phrases/goodbye_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/phrases/goodbye_demo.mp4", angle: "demo" }
                  ]
                }
              ]
            },
            { 
              id: 2, 
          title: "Please & Thank You",
              completed: false, 
          xpReward: 20,
              signs: [
                {
                  word: "Please",
                  coverImage: "/api/dictionary/signs/phrases/please.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/phrases/please_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/phrases/please_demo.mp4", angle: "demo" }
                  ]
                },
                {
                  word: "Thank you",
                  coverImage: "/api/dictionary/signs/phrases/thank_you.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/phrases/thank_you_front.png", angle: "front" },
                    { type: "image", path: "/api/dictionary/signs/phrases/thank_you_side.png", angle: "side" },
                    { type: "video", path: "/api/dictionary/signs/phrases/thank_you_demo.mp4", angle: "demo" }
                  ]
                }
              ]
            },
            { 
              id: 3, 
              title: "Basic Phrases", 
              completed: false, 
              xpReward: 10,
              signs: [
                {
                  word: "Sorry",
                  coverImage: "/api/dictionary/signs/phrases/sorry.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/phrases/sorry_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/phrases/sorry_demo.mp4", angle: "demo" }
                  ]
                }
              ]
            }
          ],
          color: "bg-green-500",
          icon: "HandRaisedIcon"
        },
        {
          _id: '2',
          title: "Alphabet",
          description: "Master the sign language alphabet",
          category: "alphabet",
          order: 2,
          level: 0,
          isCompleted: false,
          isUnlocked: true,
          progress: 0,
          xpReward: 100,
          lessons: [
            { 
              id: 1, 
              title: "Letters A-M", 
              completed: false, 
              xpReward: 30,
              signs: [
                {
                  word: "A",
                  coverImage: "/api/dictionary/signs/alphabet/a.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/alphabet/a_front.png", angle: "front" },
                    { type: "image", path: "/api/dictionary/signs/alphabet/a_side.png", angle: "side" },
                    { type: "video", path: "/api/dictionary/signs/alphabet/a_demo.mp4", angle: "demo" }
                  ]
                },
                {
                  word: "B",
                  coverImage: "/api/dictionary/signs/alphabet/b.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/alphabet/b_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/alphabet/b_demo.mp4", angle: "demo" }
                  ]
                }
              ]
            },
            { 
              id: 2, 
              title: "Letters N-Z", 
              completed: false, 
          xpReward: 30,
              signs: [
                {
                  word: "N",
                  coverImage: "/api/dictionary/signs/alphabet/n.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/alphabet/n_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/alphabet/n_demo.mp4", angle: "demo" }
                  ]
                }
              ]
            },
            { 
              id: 3, 
              title: "Numbers 1-10", 
              completed: false, 
              xpReward: 25,
              signs: [
                {
                  word: "1",
                  coverImage: "/api/dictionary/signs/numbers/1.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/numbers/1_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/numbers/1_demo.mp4", angle: "demo" }
                  ]
                },
                {
                  word: "2",
                  coverImage: "/api/dictionary/signs/numbers/2.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/numbers/2_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/numbers/2_demo.mp4", angle: "demo" }
                  ]
                }
              ]
            },
            { 
              id: 4, 
              title: "Numbers 11-20", 
              completed: false, 
              xpReward: 15,
              signs: [
                {
                  word: "11",
                  coverImage: "/api/dictionary/signs/numbers/11.png",
                  variants: [
                    { type: "image", path: "/api/dictionary/signs/numbers/11_front.png", angle: "front" },
                    { type: "video", path: "/api/dictionary/signs/numbers/11_demo.mp4", angle: "demo" }
                  ]
                }
              ]
            }
          ],
          color: "bg-blue-500",
          icon: "AcademicCapIcon"
        },
        {
          _id: '3',
          title: "Family & Friends",
          description: "Signs for relationships and people",
          category: "family",
          order: 3,
          level: 0,
          isCompleted: false,
          isUnlocked: false,
          progress: 0,
          xpReward: 75,
          lessons: [
            { id: 1, title: "Family Members", completed: false, xpReward: 25 },
            { id: 2, title: "Friends & Relationships", completed: false, xpReward: 25 },
            { id: 3, title: "Age & Descriptions", completed: false, xpReward: 25 }
          ],
          color: "bg-pink-500",
          icon: "UserCircleIcon"
        },
        {
          _id: '4',
          title: "Daily Activities",
          description: "Common daily activities and routines",
          category: "activities",
          order: 4,
          level: 0,
          isCompleted: false,
          isUnlocked: false,
          progress: 0,
          xpReward: 75,
          lessons: [
            { id: 1, title: "Morning Routine", completed: false, xpReward: 25 },
            { id: 2, title: "Work & Study", completed: false, xpReward: 25 },
            { id: 3, title: "Evening Activities", completed: false, xpReward: 25 }
          ],
          color: "bg-orange-500",
          icon: "BookOpenIcon"
        },
        {
          _id: '5',
          title: "Advanced Conversations",
          description: "Complex phrases and professional terms",
          category: "advanced",
          order: 5,
          level: 0,
          isCompleted: false,
          isUnlocked: false,
          progress: 0,
          xpReward: 100,
          lessons: [
            { id: 1, title: "Professional Terms", completed: false, xpReward: 35 },
            { id: 2, title: "Complex Phrases", completed: false, xpReward: 35 },
            { id: 3, title: "Conversation Skills", completed: false, xpReward: 30 }
          ],
          color: "bg-red-500",
          icon: "PuzzlePieceIcon"
        }
      ];
      
      setLearningPath(mockLearningPath);
      
    } catch (err) {
      console.error('Error fetching learning path:', err);
      setError('Failed to load learning content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    // Use existing user stats for progress data
    try {
      // Calculate daily goal based on user stats
      const completed = Math.floor((userStats?.totalXP || 0) / 100);
      const target = 5;
      
      setDailyGoal({ 
        completed: Math.min(completed, target), 
        target: target 
      });
      
      setStreakInfo({ 
        days: userStats?.streak || 0, 
        frozen: false 
      });
    } catch (error) {
      console.log('Using default progress data');
      // Fallback to default values
      setDailyGoal({ completed: 0, target: 5 });
      setStreakInfo({ days: 0, frozen: false });
    }
  };

  const handleUnitClick = (unit) => {
    if (unit.isUnlocked) {
      setCurrentUnit(unit);
      setShowLessonModal(true);
    }
  };

  const handleLessonComplete = (result) => {
    // Update learning path locally
    setLearningPath(prev => prev.map(unit => 
      unit._id === currentUnit._id 
        ? { 
            ...unit, 
            level: unit.level + 1, 
            isCompleted: unit.level >= 4,
            progress: Math.min(100, unit.progress + 25)
          }
        : unit
    ));

    // Update daily goal
    setDailyGoal(prev => ({
      ...prev,
      completed: Math.min(prev.target, prev.completed + 1)
    }));

    setShowLessonModal(false);
    setCurrentUnit(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${text}`}>Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg text-red-500 mb-4`}>Error: {error}</p>
          <button
            onClick={fetchLearningPath}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
      {/* Top Status Bar */}
      <div className={`${bg} border-b ${border} px-6 py-3 pl-64 fixed top-0 left-0 right-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-6">
            {/* Progress Summary */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">{userStats.totalXP} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium">Lv {userStats.level}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">{userStats.streak} day streak</span>
            </div>
            <TopBarUserAvatar size={8} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area */}
        <div className={`flex-1 ml-64 ${bg} overflow-hidden pt-16`}>
          <div className="max-w-7xl mx-auto min-h-0">
            <div className="flex min-h-0">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Header - Duolingo Style */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className={`text-3xl font-bold ${text} mb-2`}>Learning Path</h1>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Master Indian Sign Language step by step
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => navigate('/practice')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <BoltIcon className="w-4 h-4 inline mr-2" />
                        Practice
                      </button>
                      <button 
                        onClick={() => navigate('/dictionary')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <ClockIcon className="w-4 h-4 inline mr-2" />
                        Dictionary
                      </button>
                    </div>
                  </div>
                </div>

                {/* Daily Goal - Duolingo Style */}
                <div className={`${cardBg} rounded-lg border ${border} p-6 mb-8`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${text}`}>Daily Goal</h3>
                    <span className="text-sm text-gray-500">
                      {dailyGoal.completed} / {dailyGoal.target} lessons
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(dailyGoal.completed / dailyGoal.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Keep your streak going!</span>
                    <span className="text-green-600 font-semibold">
                      {streakInfo.days} day streak
                    </span>
                  </div>
                </div>

                {/* Learning Path - Duolingo Style */}
                <div className="space-y-6">
                  {learningPath && learningPath.length > 0 ? learningPath.map((unit, index) => {
                    const IconComponent = unit.icon === 'HandRaisedIcon' ? HandRaisedIcon :
                                        unit.icon === 'AcademicCapIcon' ? AcademicCapIcon :
                                        unit.icon === 'UserCircleIcon' ? UserCircleIcon :
                                        unit.icon === 'BookOpenIcon' ? BookOpenIcon :
                                        unit.icon === 'PuzzlePieceIcon' ? PuzzlePieceIcon : HandRaisedIcon;
                    
                    return (
                      <div key={unit._id} className="relative">
                        {/* Unit Card */}
                        <div 
                          className={`${cardBg} rounded-lg border ${border} p-6 cursor-pointer transition-all hover:shadow-lg ${
                            unit.isUnlocked ? 'hover:scale-[1.02]' : 'opacity-60 cursor-not-allowed'
                          }`}
                          onClick={() => handleUnitClick(unit)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-lg ${unit.color}`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className={`text-xl font-bold ${text} mb-1`}>{unit.title}</h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {unit.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-gray-500">
                                    {unit.lessons?.length || 0} lessons
                                  </span>
                                  <span className="text-xs text-blue-500">
                                    {unit.xpReward || 0} XP
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {unit.isCompleted ? (
                                <div className="text-green-500 text-sm font-semibold">Completed</div>
                              ) : unit.isUnlocked ? (
                                <div className="text-blue-500 text-sm font-semibold">Start</div>
                              ) : (
                                <div className="text-gray-400 text-sm">Locked</div>
                              )}
                              <div className="w-16 bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className={`${unit.color} h-2 rounded-full transition-all duration-300`}
                                  style={{ width: `${unit.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Connection Line */}
                        {index < (learningPath?.length || 0) - 1 && (
                          <div className="flex justify-center my-4">
                            <div className="w-px h-8 bg-gray-300"></div>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8">
                      <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        No learning content available. Please try again later.
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                <div className={`${cardBg} rounded-lg border ${border} p-6 mt-8`}>
                  <h3 className={`text-xl font-bold ${text} mb-4`}>Your Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500 mb-1">
                        {learningPath?.filter(u => u.isCompleted).length || 0}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Units Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500 mb-1">
                        {learningPath?.filter(u => u.level > 0).length || 0}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Units Started
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500 mb-1">
                        {learningPath?.filter(u => !u.isUnlocked).length || 0}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Units Locked
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && currentUnit && (
        <LessonModal
          skill={currentUnit}
          onClose={() => {
            setShowLessonModal(false);
            setCurrentUnit(null);
          }}
          onComplete={handleLessonComplete}
        />
      )}
    </div>
  );
}