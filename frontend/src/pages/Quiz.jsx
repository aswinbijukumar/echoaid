import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserCircleIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  PuzzlePieceIcon,
  ArrowLeftIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import EnhancedQuiz from '../components/EnhancedQuiz';
import TopBarUserAvatar from '../components/TopBarUserAvatar';

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Use URL param for selected quiz
  const [userStats, setUserStats] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
    streakFreeze: 0,
  });
  
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { quizId } = useParams();
  // const [searchParams] = useSearchParams();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  useEffect(() => {
    fetchQuizzes();
    fetchUserStats();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/quiz', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const ls = data.user.learningStats || {};
        setUserStats({
          streak: ls.streak || 0,
          totalXP: ls.totalXP || 0,
          level: ls.level || 1,
          xpToNextLevel: ls.xpToNextLevel ?? Math.max(0, (Math.floor((ls.totalXP||0)/1000)+1)*1000 - (ls.totalXP||0)),
          streakFreeze: ls.streakFreeze || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuizComplete = () => {
    // Update user stats after quiz completion
    fetchUserStats();
    navigate('/quiz');
  };

  // Removed streak-freeze purchase to simplify gamification

  // If a quizId is present in the URL, show the EnhancedQuiz component within the dashboard layout
  if (quizId) {
    return (
      <div className={`h-screen ${bg} ${text} flex flex-col`}>
        {/* Fixed Top Status Bar */}
        <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 flex-shrink-0 sticky top-0 z-30`}>
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
              {/* Daily Streak only - removed streak freeze purchase */}
              <TopBarUserAvatar size={8} />
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Left Sidebar - Navigation */}
          <Sidebar handleLogout={handleLogout} />

          {/* Subtle line between sidebar and content */}
          <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>

          {/* Scrollable Main Content Area */}
          <div className={`flex-1 ml-64 ${bg} overflow-y-auto`}>
            <div className="p-6">
              <EnhancedQuiz 
                quizId={quizId} 
                onComplete={handleQuizComplete}
                onBack={() => navigate('/quiz')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64`}>
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
              {/* Daily Streak - simplified, no purchase */}
            <TopBarUserAvatar size={8} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>

        {/* Main Content Area */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="max-w-6xl mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                    Sign Language Quizzes
                  </h1>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Test your knowledge and earn XP!
                  </p>
                </div>
              <div className="flex items-center space-x-6">
                {/* Level Progress Ring */}
                <div className="relative w-20 h-20">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <circle cx="40" cy="40" r="32" stroke={darkMode ? '#374151' : '#E5E7EB'} strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      stroke="#3B82F6" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeLinecap="round" 
                      strokeDasharray={`${Math.min(201, Math.max(0, ((userStats.totalXP % 1000) / 1000) * 201))} 201`}
                      className="transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-bold text-blue-500">{userStats.level}</span>
                    <span className="text-xs text-gray-500">Level</span>
                  </div>
                </div>
                
                {/* Streak Ring */}
                <div className="relative w-20 h-20">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <circle cx="40" cy="40" r="32" stroke={darkMode ? '#374151' : '#E5E7EB'} strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      stroke="#F97316" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeLinecap="round" 
                      strokeDasharray={`${Math.min(201, Math.max(0, (userStats.streak / 10) * 201))} 201`}
                      className="transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-bold text-orange-500">{userStats.streak}</span>
                    <span className="text-xs text-gray-500">Streak</span>
                  </div>
                </div>
                
                {/* XP Display */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{userStats.totalXP}</div>
                  <div className="text-sm text-gray-500">Total XP</div>
                </div>
              </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className={`p-6 rounded-2xl border-2 ${border} hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 relative overflow-hidden group`}
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                        quiz.difficulty === 'Beginner' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                        quiz.difficulty === 'Intermediate' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        'bg-gradient-to-br from-red-400 to-red-600'
                      }`}></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-full ${
                              quiz.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900' :
                              quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900' :
                              'bg-red-100 dark:bg-red-900'
                            }`}>
                              <PuzzlePieceIcon className={`w-5 h-5 ${
                                quiz.difficulty === 'Beginner' ? 'text-green-600' :
                                quiz.difficulty === 'Intermediate' ? 'text-yellow-600' :
                                'text-red-600'
                              }`} />
                            </div>
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {quiz.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            <ClockIcon className="w-4 h-4" />
                            <span>{quiz.timeLimit} min</span>
                          </div>
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                          {quiz.title}
                        </h3>
                        
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                          {quiz.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <PuzzlePieceIcon className="w-4 h-4" />
                              <span>{quiz.questions?.length || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="capitalize">{quiz.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <StarIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{quiz.stats?.averageScore || 0}%</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Completion Rate</span>
                            <span>{quiz.stats?.completionRate || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                quiz.difficulty === 'Beginner' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                quiz.difficulty === 'Intermediate' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ width: `${quiz.stats?.completionRate || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{quiz.stats?.totalAttempts || 0} attempts</span>
                          </div>
                          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                            Start Quiz
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {quizzes.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <PuzzlePieceIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No Quizzes Available</h3>
                      <p className="text-gray-400">Check back later for new quizzes!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
