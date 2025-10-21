import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useAuth } from '../context/AuthContextConstants';

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
  const [latestLearningStats, setLatestLearningStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  // Simplify: remove lives system; keep answer feedback only
  // Simplified: remove combo/flashy animations
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [showIncorrectAnimation, setShowIncorrectAnimation] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  // Removed hearts warning
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const fetchQuiz = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId, fetchQuiz]);

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
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to start quiz');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitQuiz = useCallback(async () => {
    const computeLocalResults = () => {
      if (!quiz || !quiz.questions?.length) return null;
      const total = quiz.questions.length;
      let correct = 0;
      quiz.questions.forEach((q, idx) => {
        const correctText = (q.options || []).find(o => o.isCorrect)?.text;
        const ua = answers[idx]?.selectedAnswer;
        if (ua && ua === correctText) correct += 1;
      });
      const percentage = Math.round((correct / Math.max(1, total)) * 100);
      const passed = correct === total || percentage >= (quiz.passingScore || 70);
      const feedback = passed
        ? 'Great work! You answered everything correctly or met the passing score.'
        : 'Review the incorrect questions below and try again.';
      return {
        percentage,
        passed,
        feedback,
        xpEarned: 0,
        streak: undefined
      };
    };

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
        console.log('📊 Quiz submission response:', data);
        const server = data?.data || null;
        const localFallback = computeLocalResults();
        const merged = server ? { ...localFallback, ...server } : localFallback;
        console.log('📊 Final results:', merged);
        setResults(merged);
        if (data?.data?.learningStats) {
          setLatestLearningStats(data.data.learningStats);
        }
        const newlyUnlocked = data?.data?.newAchievements || [];
        setUnlockedAchievements(newlyUnlocked);
        
        // Show pretty print message for quiz completion
        if (merged.passed) {
          if (data?.data?.nextLevelUnlocked) {
            console.log('🎉 Quiz passed! Next level unlocked!');
            // Show level unlock message
            setTimeout(() => {
              alert('🎉 Congratulations! You passed the quiz and unlocked the next level!');
            }, 1000);
          } else {
            console.log('🎉 Quiz passed!');
            setTimeout(() => {
              alert('🎉 Great job! You passed the quiz!');
            }, 1000);
          }
        } else {
          console.log('📚 Quiz not passed, keep practicing!');
          setTimeout(() => {
            alert('📚 Keep practicing! You can do better next time!');
          }, 1000);
        }
        
        // Simplify: do not show achievements modal or level-up modal
        setShowAchievementsModal(false);
        setShowResults(true);
        if (onComplete) {
          onComplete(merged);
        }
      } else {
        // Use local results if server rejected
        const local = computeLocalResults();
        setResults(local);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const local = computeLocalResults();
      if (local) {
        setResults(local);
        setShowResults(true);
      } else {
        setError('Failed to submit quiz');
      }
    }
  }, [quizId, answers, onComplete]);

  const retryIncorrectOnly = () => {
    if (!quiz || !results || !quiz.questions?.length) return;
    // Build a reduced question set of only incorrectly answered questions
    const incorrectIndexes = quiz.questions
      .map((q, idx) => {
        const correctOption = q.options.find(opt => opt.isCorrect);
        const userAnswer = answers[idx]?.selectedAnswer;
        const isCorrect = userAnswer === correctOption?.text;
        return isCorrect ? null : idx;
      })
      .filter(idx => idx !== null);

    if (incorrectIndexes.length === 0) {
      // Nothing to retry; just restart full quiz quickly
      window.location.reload();
      return;
    }

    const reducedQuestions = incorrectIndexes.map(idx => quiz.questions[idx]);

    // Reset state for a new run with reduced questions
    setQuiz(prev => ({
      ...prev,
      questions: reducedQuestions
    }));
    setAnswers([]);
    setCurrentQuestion(0);
    setCombo(0);
    setMaxCombo(0);
    setShowResults(false);
    setResults(null);
    setIsStarted(true);
    // Reset timer proportionally (same per-question average time)
    // Fallback: use original quiz timeLimit minutes
    const totalSeconds = (quiz.timeLimit || 10) * 60;
    const avgPerQ = Math.max(30, Math.floor(totalSeconds / Math.max(1, (quiz.questions?.length || 1))));
    const newTime = avgPerQ * reducedQuestions.length;
    clearInterval(timerRef.current);
    setTimeLeft(newTime);
    startTimeRef.current = Date.now();
    startTimer();
  };

  // Keep reference to original total seconds to compute retry timing
  const prevTimeLimitSecondsRef = useRef(null);
  useEffect(() => {
    if (quiz?.timeLimit) {
      prevTimeLimitSecondsRef.current = quiz.timeLimit * 60;
    }
  }, [quiz?.timeLimit]);

  const copyResultsToClipboard = async () => {
    try {
      if (!results || !quiz) return;
      const lines = [];
      lines.push(`Quiz: ${quiz.title || ''}`);
      lines.push(`Score: ${results.percentage}%`);
      if (typeof results.xpEarned !== 'undefined') lines.push(`XP Earned: ${results.xpEarned}`);
      if (typeof results.streak !== 'undefined') lines.push(`Streak: ${results.streak}`);
      lines.push('');
      lines.push('Incorrect Questions:');
      quiz.questions.forEach((q, idx) => {
        const userAnswer = answers[idx]?.selectedAnswer;
        const correct = q.options.find(o => o.isCorrect)?.text;
        const isCorrect = userAnswer === correct;
        if (!isCorrect) {
          lines.push(`- Q${idx + 1}: ${q.question}`);
          lines.push(`  Your answer: ${userAnswer ?? 'N/A'}`);
          lines.push(`  Correct: ${correct ?? 'N/A'}`);
          if (q.explanation) lines.push(`  Why: ${q.explanation}`);
        }
      });
      const text = lines.join('\n');
      await navigator.clipboard.writeText(text);
      alert('Results copied to clipboard');
    } catch (e) {
      console.error('Copy failed', e);
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
    const isAnswerCorrect = selectedOption?.isCorrect || false;
    
    // Handle hearts system and animations
    if (isAnswerCorrect) {
      setShowCorrectAnimation(true);
    } else {
      setShowIncorrectAnimation(true);
    }
    
    // Auto-advance after showing feedback
    setTimeout(() => {
      setShowFeedback(false);
      setShowCorrectAnimation(false);
      setShowIncorrectAnimation(false);
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

  // Removed hearts-based early end

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
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
      <div className="max-w-5xl mx-auto">
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-transparent border border-white/20 backdrop-blur-sm' : 'bg-white border border-gray-200'}`}>
          <div className="text-center">
            <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{quiz?.title}</h2>
            <p className="text-gray-300 mb-6">{quiz?.description}</p>
            {/* Daily Goal Ring */}
            {quiz?.learning && (
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke={darkMode ? '#374151' : '#E5E7EB'} strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="56" 
                      stroke="#22C55E" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeLinecap="round" 
                      strokeDasharray={`${Math.min(352, Math.max(0, (quiz.learning.xpToday / (quiz.learning.dailyGoal||100)) * 352))} 352`}
                      className="transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Daily Goal</span>
                    <span className="text-2xl font-black text-green-500">{Math.min(quiz.learning.xpToday, quiz.learning.dailyGoal || 100)}</span>
                    <span className="text-xs text-gray-500">/ {quiz.learning.dailyGoal || 100} XP</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg border border-white/20 bg-transparent">
                <ClockIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">Time Limit</p>
                <p className="text-sm text-gray-600">{quiz?.timeLimit} minutes</p>
              </div>
              <div className="p-4 rounded-lg border border-white/20 bg-transparent">
                <StarIcon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="font-semibold">Questions</p>
                <p className="text-sm text-gray-600">{quiz?.questions?.length} questions</p>
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={isStarting}
              className={`w-full ${isStarting ? 'bg-green-400/80 cursor-not-allowed' : 'bg-green-500/90 hover:bg-green-600'} text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center border border-green-400/30`}
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
      <div className="max-w-5xl mx-auto">
        <style>{`
@keyframes fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
}
        `}</style>
        {/* Results - glass theme */}
        <div className={`p-6 rounded-2xl ${darkMode ? 'bg-transparent border border-white/20 backdrop-blur-sm' : 'bg-white border border-gray-200'}`}>
          <div className="text-center space-y-3">
            <div className={`w-20 h-20 mx-auto mb-2 rounded-full flex items-center justify-center ${
              results.passed ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}>
              {results.passed ? (
                <CheckCircleIcon className="w-12 h-12" />
              ) : (
                <XCircleIcon className="w-12 h-12" />
              )}
            </div>
            <h2 className="text-2xl font-bold">{results.passed ? 'Great job — You passed!' : 'Keep going — You can improve!'}</h2>
            <p className="text-gray-300">{results.feedback}</p>
            
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6 mt-2">
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-white/20 bg-transparent' : 'border-gray-200 bg-gray-50'}`}>
                <p className="font-semibold">Score</p>
                <p className="text-2xl font-bold text-green-500">{results.percentage}%</p>
              </div>
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-white/20 bg-transparent' : 'border-gray-200 bg-gray-50'}`}>
                <p className="font-semibold">XP Earned</p>
                <p className="text-2xl font-bold text-blue-500">{results.xpEarned}</p>
              </div>
          {latestLearningStats && (
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-white/20 bg-transparent' : 'border-gray-200 bg-gray-50'} col-span-2`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-yellow-400" />
                  <p className="font-semibold">Level {latestLearningStats.level}</p>
                </div>
                <div className="text-sm text-gray-500">{latestLearningStats.xpToNextLevel ?? Math.max(0, (Math.floor(((latestLearningStats.totalXP||0))/1000)+1)*1000 - (latestLearningStats.totalXP||0))} XP to next</div>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                  style={{ width: `${Math.max(0, Math.min(100, (((latestLearningStats.totalXP || 0) % 1000) / 1000) * 100))}%` }}
                />
              </div>
            </div>
          )}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-white/20 bg-transparent' : 'border-gray-200 bg-gray-50'} col-span-2`}>
                <div className="flex items-center justify-center space-x-2">
                  <FireIcon className="w-5 h-5 text-orange-500" />
                  <p className="font-semibold">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-500">{results.streak ?? 0}</p>
                </div>
              </div>
            </div>

            {/* Improvement suggestions */}
            <div className="mb-6 text-left">
              <h3 className="text-lg font-semibold mb-3">Suggested improvements</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-300">
                {(() => {
                  const incorrect = (quiz?.questions || []).map((q, idx) => {
                    const correct = q.options.find(o => o.isCorrect)?.text;
                    const ua = answers[idx]?.selectedAnswer;
                    return ua && ua !== correct ? idx : null;
                  }).filter(i => i !== null).slice(0, 3);
                  if (incorrect.length === 0) {
                    return <li>Excellent accuracy. Try a harder quiz next time.</li>;
                  }
                  return incorrect.map(i => (
                    <li key={i}>Review question {i + 1}. {quiz.questions[i].explanation ? 'See explanation in review.' : 'Focus on understanding the correct sign.'}</li>
                  ));
                })()}
              </ul>
            </div>

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
                      
                      {/* Show image or video if exists */}
                      {question.mediaUrl && (
                        <div className="mb-3 flex justify-center">
                          <img 
                            src={question.mediaUrl} 
                            alt="Question media" 
                            className="max-w-full h-32 object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                      {question.videoUrl && (
                        <div className="mb-3 flex justify-center">
                          <video 
                            src={question.videoUrl} 
                            controls
                            className="max-w-full h-48 object-contain rounded-lg shadow-sm"
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Back to Quizzes
              </button>
              <button
                onClick={retryIncorrectOnly}
                className="flex-1 bg-yellow-500/90 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors border border-yellow-400/30"
              >
                Retry Incorrect Only
              </button>
              <button
                onClick={copyResultsToClipboard}
                className="flex-1 bg-indigo-500/90 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors border border-indigo-400/30"
              >
                Copy Results
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-green-500/90 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors border border-green-400/30"
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
    <div className="max-w-5xl mx-auto">
      <AchievementsModal />
      
      {/* Removed hearts warning modal */}
      
      <div className={`p-0 ${darkMode ? 'bg-transparent border border-white/20 backdrop-blur-sm' : 'bg-white border border-gray-200'} rounded-2xl`}>
        {/* Duolingo-style Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 space-y-4 lg:space-y-0 sticky top-0 z-10 p-4 border-b border-white/20 bg-transparent backdrop-blur-sm">
          <div className="flex flex-wrap items-center space-x-2 lg:space-x-4">
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
            
            {/* Removed hearts display */}
            
            {/* Gamification removed inside quiz content (top bar shows streak/xp/level) */}
            
            {/* Removed in-quiz gamification counters from header */}
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
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
        <div className="mb-4 px-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card - Duolingo Style */}
        <div className="mb-2 px-4">
          <div className={`p-6 rounded-2xl border border-white/20 relative overflow-hidden bg-transparent`}>
            {/* Background Animation for Correct/Incorrect */}
            {showCorrectAnimation && (
              <div className="absolute inset-0 bg-green-100 dark:bg-green-900 opacity-50 animate-pulse"></div>
            )}
            {showIncorrectAnimation && (
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900 opacity-50 animate-pulse"></div>
            )}
            
            <h3 className="text-2xl font-semibold mb-4 text-center relative z-10">{question.question}</h3>
            
            {question.mediaUrl && (
              <div className="mb-4 flex justify-center relative z-10">
                <img 
                  src={question.mediaUrl} 
                  alt="Question media" 
                  className="max-w-full h-64 object-contain rounded-xl border border-white/20"
                />
              </div>
            )}
            {question.videoUrl && (
              <div className="mb-4 flex justify-center relative z-10">
                <video 
                  src={question.videoUrl} 
                  controls
                  className="max-w-full h-64 object-contain rounded-xl border border-white/20"
                />
              </div>
            )}

            <div className="space-y-3 relative z-10">
              {question.options.map((option, index) => {
                const isSelected = answers[currentQuestion]?.selectedAnswer === option.text;
                const isCorrect = option.isCorrect;
                const shouldShowFeedback = showFeedback && answers[currentQuestion];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion, option.text)}
                    disabled={shouldShowFeedback}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 transform hover:scale-[1.01] disabled:cursor-not-allowed ${
                      shouldShowFeedback
                        ? isCorrect
                          ? 'border-green-500/60 bg-green-500/10 text-green-200 shadow-lg scale-[1.01]'
                          : isSelected
                          ? 'border-red-500/60 bg-red-500/10 text-red-200 shadow-lg scale-[1.01]'
                          : 'border-white/10 bg-white/5 text-gray-300'
                        : isSelected
                        ? 'border-blue-500/60 bg-blue-500/10 text-blue-200 shadow-md'
                        : 'border-white/10 bg-transparent text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">
                        {String.fromCharCode(65 + index)}) {option.text}
                      </span>
                      {shouldShowFeedback && isCorrect && (
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-6 h-6 text-green-500 animate-bounce" />
                          <span className="text-green-600 font-bold">Correct!</span>
                        </div>
                      )}
                      {shouldShowFeedback && isSelected && !isCorrect && (
                        <div className="flex items-center space-x-2">
                          <XCircleIcon className="w-6 h-6 text-red-500 animate-bounce" />
                          <span className="text-red-600 font-bold">Wrong</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Combo Display */}
            {/* Simplified: hide combo badge */}
          </div>
        </div>

        {/* Sticky Navigation */}
        <div className="flex justify-between items-center mt-4 p-4 border-t border-white/20 sticky bottom-0 bg-transparent backdrop-blur-sm">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg border border-green-400/30"
              >
                <TrophyIcon className="w-5 h-5 mr-2" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion]?.selectedAnswer}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg border border-blue-400/30"
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