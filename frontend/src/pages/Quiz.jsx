import { useState, useEffect, useCallback } from 'react';
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
  StarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import Sidebar from '../components/Sidebar';
import EnhancedQuiz from '../components/EnhancedQuiz';
import { useLearning } from '../context/LearningContext';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import PageHeader from '../components/PageHeader';
import { API_BASE_URL, withAuth } from '../constants/api.js';

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [learningModules, setLearningModules] = useState([]);
  const [quizRequirements, setQuizRequirements] = useState([]);
  // Use URL param for selected quiz
  const [userStats, setUserStats] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
    streakFreeze: 0,
  });

  const { darkMode } = useTheme();
  const { logout, user } = useAuth();
  const { devMode, refresh: refreshLearningPath } = useLearning();
  const navigate = useNavigate();
  const { quizId } = useParams();

  // Compute the effective per-quiz attempt limit based on the user's plan
  const getEffectiveMaxAttempts = (quiz) => {
    const plan = user?.subscription?.plan || 'free';
    const role = user?.role;
    if (role === 'admin' || plan === 'enterprise') return Infinity;
    if (plan === 'premium') return 8;
    if (plan === 'pro') return 5;
    return quiz?.maxAttempts || 3;
  };

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz`, withAuth());
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
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, withAuth());
      const data = await response.json();
      if (data.success) {
        const ls = data.user.learningStats || {};
        setUserStats({
          streak: ls.streak || 0,
          totalXP: ls.totalXP || 0,
          level: ls.level || 1,
          xpToNextLevel: ls.xpToNextLevel ?? Math.max(0, (Math.floor((ls.totalXP || 0) / 1000) + 1) * 1000 - (ls.totalXP || 0)),
          streakFreeze: ls.streakFreeze || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchLearningModules = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/skills`, withAuth());
      const data = await response.json();
      if (data.success) {
        // setLearningModules(data.data || []);
        checkQuizRequirements(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching learning modules:', error);
    }
  }, []);

  const checkQuizRequirements = (modules) => {
    // Group modules by level
    const modulesByLevel = modules.reduce((acc, module) => {
      const level = module.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(module);
      return acc;
    }, {});

    // Check requirements for each level
    const requirements = Object.keys(modulesByLevel).map(level => {
      const levelModules = modulesByLevel[level];
      const completedModules = levelModules.filter(module => module.isCompleted);
      const totalModules = levelModules.length;
      const isLevelCompleted = completedModules.length === totalModules;

      if (devMode) {
        return {
          level: parseInt(level),
          totalModules,
          completedModules: totalModules, // Visual fake
          isLevelCompleted: true,
          modules: levelModules
        };
      }

      return {
        level: parseInt(level),
        totalModules,
        completedModules: completedModules.length,
        isLevelCompleted,
        modules: levelModules
      };
    });

    setQuizRequirements(requirements);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuizComplete = () => {
    // Update user stats after quiz completion; stay on results view
    fetchUserStats();
    // Refresh learning modules to update completion status
    fetchLearningModules();
    // Refresh the LearningContext so LevelTree auto-loads newly unlocked level's lessons
    refreshLearningPath();
    // Do not navigate away; let EnhancedQuiz show results until user clicks Back
  };

  const isQuizUnlocked = (quiz) => {
    if (devMode) return true;

    // Check if user has reached max attempts (relearning triggered)
    // If so, it should stay "unlocked" but show the special "Review Modules" button
    const hasAttemptsReached = quiz.userStatus?.attempts >= quiz.maxAttempts;

    // Check if this is a level mastery quiz
    const levelMatch = quiz.title.match(/Level (\d+)/);
    if (levelMatch && quiz.title.includes('Mastery Quiz')) {
      const requiredLevel = parseInt(levelMatch[1]);

      // Mastery Quiz for Level X requires Level X modules to be done
      const levelReq = quizRequirements.find(req => req.level === requiredLevel);
      const isLevelComplete = levelReq ? levelReq.isLevelCompleted : false;

      console.log(`🔍 Level ${requiredLevel} Mastery Quiz unlock check: Level ${requiredLevel} completed: ${isLevelComplete}, attemptsReached: ${hasAttemptsReached}`);

      // Unlock if level complete OR if they reached max attempts and need to review
      return isLevelComplete || hasAttemptsReached;
    }

    // For other quizzes, check if they're active
    return quiz.isActive;
  };

  const getRelearningInfo = (quiz) => {
    const levelMatch = quiz.title.match(/Level (\d+)/);
    if (!levelMatch || !quiz.title.includes('Mastery Quiz')) {
      return null;
    }

    const requiredLevel = parseInt(levelMatch[1]);
    const levelReq = quizRequirements.find(req => req.level === requiredLevel);

    if (!levelReq) return null;

    const incompleteModules = levelReq.modules?.filter(m => !m.isCompleted || m.isRelearning) || [];
    const relearningModules = levelReq.modules?.filter(m => m.isRelearning) || [];

    return {
      totalModules: levelReq.totalModules,
      completedModules: levelReq.completedModules,
      incompleteModules,
      relearningModules,
      hasRelearning: relearningModules.length > 0
    };
  };

  const getQuizStatus = (quiz) => {
    if (!isQuizUnlocked(quiz)) {
      return 'locked';
    }

    // Check if user has completed this quiz
    if (quiz.userStatus?.passed || quiz.userStatus?.completed) {
      return 'completed';
    }

    return 'available';
  };

  useEffect(() => {
    fetchQuizzes();
    fetchUserStats();
    fetchLearningModules();
  }, [fetchLearningModules]);

  // Removed streak-freeze purchase to simplify gamification

  // If a quizId is present in the URL, show the EnhancedQuiz component within the dashboard layout
  if (quizId) {
    return (
      <div className={`h-screen ${bg} ${text} flex flex-col`}>
        {/* Fixed Top Status Bar - Match Practice and Dictionary pages exactly */}
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
              {/* Daily Streak only - removed streak freeze purchase */}
              <TopBarUserAvatar size={8} />
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Left Sidebar - Navigation */}
          <Sidebar handleLogout={handleLogout} />

          {/* Subtle line between sidebar and content */}
          <div className="fixed left-64 top-0 h-screen w-px bg-gray-300 dark:bg-gray-600 z-40"></div>

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
      {/* Fixed Top Status Bar - Match Practice and Dictionary pages exactly */}
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
            {/* Daily Streak - simplified, no purchase */}
            <TopBarUserAvatar size={8} />
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
          <div className="max-w-6xl mx-auto">
            <div className="p-6 pt-20">
              <div className="flex items-center justify-between mb-8">
                <PageHeader title="Assessments" subtitle="Test your sign language knowledge and earn XP!" className="mb-0" />
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
                      <span className="text-xs text-gray-500">Rank</span>
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
                <>
                  {/* Quiz Requirements Section */}
                  {quizRequirements.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 text-white">Level Progression</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {quizRequirements.map((req) => (
                          <div key={req.level} className={`p-4 rounded-2xl border ${border} ${req.isLevelCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-500/10 border-gray-500/30'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">Level {req.level}</h4>
                              {req.isLevelCompleted ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              ) : (
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="text-sm text-white/70 mb-2">
                              {req.completedModules}/{req.totalModules} modules completed
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(req.completedModules / req.totalModules) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quizzes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => {
                      const status = getQuizStatus(quiz);
                      const isLocked = status === 'locked';

                      return (
                        <div
                          key={quiz._id}
                          className={`p-6 rounded-2xl border-2 ${border} ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105'
                            } relative overflow-hidden group`}
                          onClick={() => !isLocked && navigate(`/quiz/${quiz._id}`)}
                        >
                          {/* Background Gradient */}
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${quiz.difficulty === 'Beginner' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                            quiz.difficulty === 'Intermediate' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                              'bg-gradient-to-br from-red-400 to-red-600'
                            }`}></div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-full ${isLocked ? 'bg-gray-100 dark:bg-gray-700' :
                                  quiz.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900' :
                                    quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900' :
                                      'bg-red-100 dark:bg-red-900'
                                  }`}>
                                  {isLocked ? (
                                    <LockClosedIcon className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <PuzzlePieceIcon className={`w-5 h-5 ${quiz.difficulty === 'Beginner' ? 'text-green-600' :
                                      quiz.difficulty === 'Intermediate' ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`} />
                                  )}
                                </div>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${isLocked ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' :
                                  status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                      quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                  {isLocked ? 'Locked' : status === 'completed' ? 'Completed' : quiz.difficulty}
                                </span>
                              </div>

                              {/* Top Right Status Badge */}
                              {status === 'completed' && (
                                <div className="flex items-center space-x-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  <span>Passed</span>
                                </div>
                              )}
                              {!isLocked && status !== 'completed' && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>{quiz.timeLimit} min</span>
                                </div>
                              )}
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
                                  className={`h-2 rounded-full transition-all duration-500 ${quiz.difficulty === 'Beginner' ? 'bg-gradient-to-r from-green-400 to-green-500' :
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
                               {isLocked ? (
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <LockClosedIcon className="w-4 h-4" />
                                  <span className="text-sm">
                                    {quiz.title.includes('Mastery Quiz')
                                      ? `Complete Level ${parseInt(quiz.title.match(/Level (\d+)/)?.[1] || 0)} modules`
                                      : 'Complete modules to unlock'
                                    }
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col space-y-2 w-full">
                                  {status !== 'completed' && (() => {
                                    const effectiveMax = getEffectiveMaxAttempts(quiz);
                                    const displayAttempts = Math.min(quiz.userStatus?.attempts || 0, effectiveMax === Infinity ? (quiz.userStatus?.attempts || 0) : effectiveMax);
                                    const displayMax = effectiveMax === Infinity ? '∞' : effectiveMax;
                                    const isAtLimit = (quiz.userStatus?.attempts || 0) >= effectiveMax;
                                    return (
                                      <span className={isAtLimit ? 'text-red-500 font-medium text-sm' : 'text-sm text-gray-400'}>
                                        Attempts: {displayAttempts}/{displayMax}
                                      </span>
                                    );
                                  })()}
                                  <button
                                    className={`w-full px-6 py-2 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${status === 'completed'
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                                      }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const relearningInfo = getRelearningInfo(quiz);
                                      const isLevelActuallyComplete = relearningInfo &&
                                        relearningInfo.incompleteModules.length === 0 &&
                                        !relearningInfo.hasRelearning;

                                      if (quiz.userStatus?.attempts >= getEffectiveMaxAttempts(quiz) &&
                                        status !== 'completed' &&
                                        !isLevelActuallyComplete) {
                                        navigate('/learn');
                                      } else {
                                        navigate(`/quiz/${quiz._id}`);
                                      }
                                    }}
                                  >
                                    {status === 'completed' 
                                      ? 'Retake Quiz' 
                                      : (quiz.userStatus?.attempts >= getEffectiveMaxAttempts(quiz) && !getRelearningInfo(quiz)?.isLevelActuallyComplete)
                                        ? 'Review Modules'
                                        : 'Start Quiz'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {quizzes.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <PuzzlePieceIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">No Quizzes Available</h3>
                        <p className="text-gray-400">Check back later for new quizzes!</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
