import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [userStats, setUserStats] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
  });
  
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
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
    setSelectedQuiz(null);
  };

  // If a quiz is selected, show the EnhancedQuiz component within the dashboard layout
  if (selectedQuiz) {
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
                quizId={selectedQuiz._id} 
                onComplete={handleQuizComplete}
                onBack={() => setSelectedQuiz(null)}
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
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">Level {userStats.level}</div>
                    <div className="text-sm text-gray-500">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{userStats.streak}</div>
                    <div className="text-sm text-gray-500">Day Streak</div>
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
                      className={`p-6 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer`}
                      onClick={() => setSelectedQuiz(quiz)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <PuzzlePieceIcon className="w-6 h-6 text-blue-500" />
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                            quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quiz.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{quiz.timeLimit} min</span>
                        </div>
                      </div>
                      
                      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {quiz.title}
                      </h3>
                      
                      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {quiz.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{quiz.questions?.length || 0} questions</span>
                          <span className="capitalize">{quiz.category}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <StarIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{quiz.stats?.averageScore || 0}%</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {quiz.stats?.totalAttempts || 0} attempts
                          </span>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
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
