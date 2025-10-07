import { useState, useEffect, useRef } from 'react';
import { 
  ClockIcon, 
  FireIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  StarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

const EnhancedQuiz = ({ quizId, onComplete, onBack }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [latestLearningStats, setLatestLearningStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const { darkMode } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quiz/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuiz(data.data);
        setTimeLeft(data.data.timeLimit * 60); // Convert minutes to seconds
      } else {
        setError('Failed to load quiz');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      setIsStarting(true);
      const response = await fetch('http://localhost:5000/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quizId })
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.data);
        setTimeLeft(data.data.timeLimit * 60);
        setIsStarted(true);
        startTimer();
        startTimeRef.current = Date.now();
      } else if (response.status === 403) {
        const data = await response.json();
        setError(data.message || 'Quiz is locked. Complete prerequisites to unlock.');
      } else if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Unable to start this quiz (Bad Request).');
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || `Failed to start quiz (status ${response.status}).`);
      }
    } catch (err) {
      setError('Failed to start quiz');
    } finally {
      setIsStarting(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const togglePause = () => {
    if (isPaused) {
      startTimer();
    } else {
      clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = {
      selectedAnswer,
      timeSpent: Date.now() - startTimeRef.current
    };
    setAnswers(newAnswers);
    
    // Show feedback for a moment
    setShowFeedback(true);
    const question = quiz.questions[questionIndex];
    const selectedOption = question.options.find(opt => opt.text === selectedAnswer);
    setIsCorrect(selectedOption?.isCorrect || false);
    
    // Auto-advance after showing feedback
    setTimeout(() => {
      setShowFeedback(false);
      if (questionIndex < quiz.questions.length - 1) {
        handleNext();
      }
    }, 1500);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quizId,
          answers,
          timeSpent: Date.now() - startTimeRef.current
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.data);
        if (data?.data?.learningStats) {
          setLatestLearningStats(data.data.learningStats);
        }
        const newlyUnlocked = data?.data?.newAchievements || [];
        setUnlockedAchievements(newlyUnlocked);
        if (newlyUnlocked.length > 0) {
          setShowAchievementsModal(true);
        }
        if (data?.data?.levelUp) {
          setShowLevelUpModal(true);
        }
        setShowResults(true);
        if (onComplete) {
          onComplete(data.data);
        }
      }
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="text-center">
            <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{quiz?.title}</h2>
            <p className="text-gray-600 mb-6">{quiz?.description}</p>
            {/* Daily Goal Ring */}
            {quiz?.learning && (
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle cx="48" cy="48" r="42" stroke={darkMode ? '#374151' : '#E5E7EB'} strokeWidth="10" fill="transparent" />
                    <circle cx="48" cy="48" r="42" stroke="#22C55E" strokeWidth="10" fill="transparent" strokeLinecap="round" strokeDasharray={`${Math.min(264, Math.max(0, (quiz.learning.xpToday / (quiz.learning.dailyGoal||100)) * 264))} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-semibold">Daily</span>
                    <span className="text-lg font-black text-green-500">{Math.min(quiz.learning.xpToday, quiz.learning.dailyGoal || 100)}</span>
                    <span className="text-xs text-gray-500">/ {quiz.learning.dailyGoal || 100} XP</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <ClockIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">Time Limit</p>
                <p className="text-sm text-gray-600">{quiz?.timeLimit} minutes</p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <StarIcon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="font-semibold">Questions</p>
                <p className="text-sm text-gray-600">{quiz?.questions?.length} questions</p>
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={isStarting}
              className={`w-full ${isStarting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center`}
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              {isStarting ? 'Starting...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Level Up Modal */}
        {showLevelUpModal && latestLearningStats && (
          <Modal isOpen={showLevelUpModal} onClose={() => setShowLevelUpModal(false)} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl border-2 ${darkMode ? 'border-gray-700' : 'border-green-200'}`} widthClass="w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-bold">Level Up!</h3>
                </div>
                <button onClick={() => setShowLevelUpModal(false)} className="text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
              </div>
              <div className="text-center py-4">
                <div className="text-5xl font-black text-green-500 mb-2">Lv {latestLearningStats.level}</div>
                <div className="text-gray-500">Great job! Keep the streak going.</div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-1">XP Progress</div>
                <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${Math.max(0, Math.min(100, (((latestLearningStats.totalXP || 0) % 1000) / 1000) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{(latestLearningStats.totalXP || 0) % 1000} / 1000 XP</span>
                  <span>{latestLearningStats.xpToNextLevel ?? Math.max(0, (Math.floor(((latestLearningStats.totalXP||0))/1000)+1)*1000 - (latestLearningStats.totalXP||0))} to next</span>
                </div>
              </div>
          </Modal>
        )}

        <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              results.passed ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
            }`}>
              {results.passed ? (
                <CheckCircleIcon className="w-12 h-12" />
              ) : (
                <XCircleIcon className="w-12 h-12" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              {results.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 mb-6">{results.feedback}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="font-semibold">Score</p>
                <p className="text-2xl font-bold text-green-500">{results.percentage}%</p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="font-semibold">XP Earned</p>
                <p className="text-2xl font-bold text-blue-500">{results.xpEarned}</p>
              </div>
              {(results.perfect || results.fast) && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} col-span-2 flex gap-2 justify-center`}>
                  {results.perfect && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Perfect!</span>
                  )}
                  {results.fast && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Fast Finish</span>
                  )}
                </div>
              )}
          {latestLearningStats && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} col-span-2`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-yellow-400" />
                  <p className="font-semibold">Level {latestLearningStats.level}</p>
                </div>
                <div className="text-sm text-gray-500">{latestLearningStats.xpToNextLevel ?? Math.max(0, (Math.floor(((latestLearningStats.totalXP||0))/1000)+1)*1000 - (latestLearningStats.totalXP||0))} XP to next</div>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                  style={{ width: `${Math.max(0, Math.min(100, (((latestLearningStats.totalXP || 0) % 1000) / 1000) * 100))}%` }}
                />
              </div>
            </div>
          )}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} col-span-2`}>
                <div className="flex items-center justify-center space-x-2">
                  <FireIcon className="w-5 h-5 text-orange-500" />
                  <p className="font-semibold">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-500">{results.streak ?? 0}</p>
                </div>
              </div>
            </div>

            {results.newAchievements && results.newAchievements.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">New Achievements!</h3>
                {results.newAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">{achievement.icon}</span>
                    <span className="font-medium">{achievement.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Question Review Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Question Review</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[index]?.selectedAnswer;
                  const correctOption = question.options.find(opt => opt.isCorrect);
                  const isCorrect = userAnswer === correctOption?.text;
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">Question {index + 1}</h4>
                        <div className="flex items-center space-x-1">
                          {isCorrect ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{question.question}</p>
                      
                      {/* Show image if exists */}
                      {question.mediaUrl && (
                        <div className="mb-3 flex justify-center">
                          <img 
                            src={question.mediaUrl} 
                            alt="Question media" 
                            className="max-w-full h-32 object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Your Answer: </span>
                          <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {userAnswer || 'No answer selected'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-600">Correct Answer: </span>
                          <span className="font-semibold text-green-600">
                            {correctOption?.text}
                          </span>
                        </div>
                        {question.explanation && (
                          <div className="text-sm mt-2 p-2 bg-blue-50 rounded">
                            <span className="font-medium text-blue-600">Explanation: </span>
                            <span className="text-blue-800">{question.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Quizzes
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Achievements modal
  const AchievementsModal = () => {
    if (!showAchievementsModal || unlockedAchievements.length === 0) return null;
    return (
      <Modal isOpen={showAchievementsModal} onClose={() => setShowAchievementsModal(false)} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl`} widthClass="w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold">Achievements Unlocked</h3>
            </div>
            <button onClick={() => setShowAchievementsModal(false)} className="text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
          </div>
          <ul className="space-y-3">
            {unlockedAchievements.map((a) => (
              <li key={a._id} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-start justify-between`}>
                <div>
                  <div className="font-medium">{a.title || a.name}</div>
                  {a.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-300">{a.description}</div>
                  )}
                </div>
                {a.xpReward ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <SparklesIcon className="w-5 h-5" />
                    <span className="font-semibold">+{a.xpReward} XP</span>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowAchievementsModal(false)}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
          >
            Awesome!
          </button>
      </Modal>
    );
  };

  const question = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto">
      <AchievementsModal />
      <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        {/* Duolingo-style Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={() => {
                  const hasProgress = answers.length > 0 && answers.some(a => a && a.selectedAnswer);
                  if (!hasProgress || window.confirm('Leave quiz? Your current progress will be lost.')) {
                    onBack();
                  }
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                aria-label="Back to quizzes"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">{user?.learningStats?.streak || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{user?.learningStats?.totalXP || 0} XP</span>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Lv {user?.learningStats?.level || 1}</span>
              <span className="text-sm text-gray-400">({(user?.learningStats?.xpToNextLevel ?? 100)} to next)</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePause}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              {isPaused ? (
                <PlayIcon className="w-5 h-5" />
              ) : (
                <PauseIcon className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-red-500" />
              <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card - Duolingo Style */}
        <div className="mb-8">
          <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-2 border-transparent`}>
            <h3 className="text-2xl font-semibold mb-6 text-center">{question.question}</h3>
            
            {question.mediaUrl && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={question.mediaUrl} 
                  alt="Question media" 
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              {question.options.map((option, index) => {
                const isSelected = answers[currentQuestion]?.selectedAnswer === option.text;
                const isCorrect = option.isCorrect;
                const shouldShowFeedback = showFeedback && answers[currentQuestion];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, option.text)}
                    disabled={shouldShowFeedback}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                      shouldShowFeedback
                        ? isCorrect
                          ? 'border-green-500 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : isSelected
                          ? 'border-red-500 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'border-gray-300 bg-gray-100 dark:bg-gray-600 text-gray-500'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">
                        {String.fromCharCode(65 + index)}) {option.text}
                      </span>
                      {shouldShowFeedback && isCorrect && (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      )}
                      {shouldShowFeedback && isSelected && !isCorrect && (
                        <XCircleIcon className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Duolingo-style Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <TrophyIcon className="w-5 h-5 mr-2" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion]?.selectedAnswer}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Next
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuiz;