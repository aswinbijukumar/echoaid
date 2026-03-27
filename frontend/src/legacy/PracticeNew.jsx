import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { useLearning } from '../context/LearningContext'; // Import Context
import { useUserStats } from '../hooks/useUserStats';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import {
  BoltIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  HandRaisedIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

<<<<<<< HEAD:frontend/src/legacy/PracticeNew.jsx
=======
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

>>>>>>> dc62a1aeab24bf46cb3b9305bc8d4f9124e3d6d1:frontend/src/pages/PracticeNew.jsx
export default function Practice() {
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const { stats: userStats } = useUserStats();
  const { knownSigns, loading } = useLearning(); // Use actual known signs
  const navigate = useNavigate();

  // Practice state
  const [practiceMode, setPracticeMode] = useState('review');
  const [recentSigns, setRecentSigns] = useState([]);
  const [weakSigns, setWeakSigns] = useState([]);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  useEffect(() => {
    // Process known signs to categorize them
    if (knownSigns.length > 0) {
      // For now, just show the last 5 learned signs as 'Recent'
      // In a real app, you'd track 'lastPracticedAt'
      setRecentSigns(knownSigns.slice(-5));

      // Randomly pick some "Weak" signs for now, or real logic if backend supports it
      setWeakSigns(knownSigns.length > 5 ? knownSigns.slice(0, 3) : []);
    } else {
      setRecentSigns([]);
      setWeakSigns([]);
    }
  }, [knownSigns]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startPractice = (sign, mode = 'review') => {
    // Navigate to practice session
    navigate('/practice/session', {
      state: {
        sign: sign,
        mode: mode,
        practiceType: 'strengthen'
      }
    });
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBg = (accuracy) => {
    if (accuracy >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (accuracy >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${text}`}>Loading practice data...</p>
        </div>
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
                      <h1 className={`text-3xl font-bold ${text} mb-2`}>Practice</h1>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Strengthen your sign language skills
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate('/learn')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <AcademicCapIcon className="w-4 h-4 inline mr-2" />
                        Learning Path
                      </button>
                      <button
                        onClick={() => navigate('/dictionary')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <HandRaisedIcon className="w-4 h-4 inline mr-2" />
                        Dictionary
                      </button>
                    </div>
                  </div>
                </div>

                {/* Daily Goal - Simplified */}
                <div className={`${cardBg} rounded-lg border ${border} p-6 mb-8`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${text}`}>Today's XP Goal</h3>
                    <span className="text-sm text-gray-500">
                      {userStats.totalXP % 100} / 50 XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(((userStats.totalXP % 100) / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Keep practicing!</span>
                    <span className="text-blue-600 font-semibold">
                      {userStats.streak} day streak
                    </span>
                  </div>
                </div>

                {/* Practice Modes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Recent Signs */}
                  <div className={`${cardBg} rounded-lg border ${border} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${text}`}>Recent Signs</h3>
                      <span className="text-sm text-gray-500">Practice what you learned</span>
                    </div>

                    <div className="space-y-3">
                      {recentSigns.length === 0 ? (
                        <p className="text-gray-500 italic">Complete lessons to see signs here.</p>
                      ) : (
                        recentSigns.map((sign, index) => (
                          <div
                            key={sign._id || index}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${getAccuracyBg(sign.accuracy || 100)}`}>
                                <CheckCircleIcon className={`w-5 h-5 ${getAccuracyColor(sign.accuracy || 100)}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold">{sign.word}</h4>
                                <p className="text-sm text-gray-500">{sign.category || 'learned'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-semibold ${getAccuracyColor(sign.accuracy || 100)}`}>
                                {sign.accuracy ?? 100}%
                              </span>
                              <button
                                onClick={() => startPractice(sign, 'review')}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                              >
                                Practice
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Weak Areas */}
                  <div className={`${cardBg} rounded-lg border ${border} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${text}`}>Weak Areas</h3>
                      <span className="text-sm text-gray-500">Focus on improvement</span>
                    </div>

                    <div className="space-y-3">
                      {weakSigns.map((sign) => (
                        <div
                          key={sign.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getAccuracyBg(sign.accuracy)}`}>
                              <ExclamationTriangleIcon className={`w-5 h-5 ${getAccuracyColor(sign.accuracy)}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{sign.word}</h4>
                              <p className="text-sm text-gray-500">{sign.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm font-semibold ${getAccuracyColor(sign.accuracy)}`}>
                              {sign.accuracy}%
                            </span>
                            <button
                              onClick={() => startPractice(sign, 'weak')}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Improve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Practice Options */}
                <div className={`${cardBg} rounded-lg border ${border} p-6`}>
                  <h3 className={`text-xl font-bold ${text} mb-4`}>Practice Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setPracticeMode('review')}
                      className={`p-4 rounded-lg border transition-all ${practiceMode === 'review'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="w-6 h-6 text-blue-500" />
                        <div className="text-left">
                          <h4 className="font-semibold">Review</h4>
                          <p className="text-sm text-gray-500">Practice recent signs</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPracticeMode('speed')}
                      className={`p-4 rounded-lg border transition-all ${practiceMode === 'speed'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <BoltIcon className="w-6 h-6 text-green-500" />
                        <div className="text-left">
                          <h4 className="font-semibold">Speed Practice</h4>
                          <p className="text-sm text-gray-500">Quick recognition</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPracticeMode('accuracy')}
                      className={`p-4 rounded-lg border transition-all ${practiceMode === 'accuracy'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <TrophyIcon className="w-6 h-6 text-purple-500" />
                        <div className="text-left">
                          <h4 className="font-semibold">Accuracy Practice</h4>
                          <p className="text-sm text-gray-500">Perfect your form</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`${cardBg} rounded-lg border ${border} p-6 mt-8`}>
                  <h3 className={`text-xl font-bold ${text} mb-4`}>Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate('/dictionary')}
                      className="flex items-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <HandRaisedIcon className="w-6 h-6" />
                      <span>Browse Dictionary</span>
                    </button>
                    <button
                      onClick={() => navigate('/quiz')}
                      className="flex items-center space-x-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <PlayIcon className="w-6 h-6" />
                      <span>Take a Quiz</span>
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
    </div>
  );
}