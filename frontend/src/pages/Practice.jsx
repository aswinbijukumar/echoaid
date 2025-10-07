import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import PracticeCard from '../components/PracticeCard';
import PracticeStats from '../components/PracticeStats';
import PracticeModeCard from '../components/PracticeModeCard';
import PracticeSession from '../components/PracticeSession';
import UnifiedLearning from '../components/UnifiedLearning';
import Sidebar from '../components/Sidebar';
import BackToTop from '../components/BackToTop';
import { 
  HandRaisedIcon, 
  CameraIcon, 
  PhotoIcon,
  PlayIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ArrowUpIcon,
  AcademicCapIcon,
  PuzzlePieceIcon,
  UserCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Practice() {
  const { token, logout, user } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  
  // Practice state
  const [practiceMode, setPracticeMode] = useState('guided'); // 'guided', 'free', 'challenge'
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [, setIsEvaluating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [selectedSign, setSelectedSign] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [useUnifiedLearning, setUseUnifiedLearning] = useState(true);
  
  // Data state
  const [signs, setSigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  
  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('beginner');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-start session if navigated with state from Dictionary
  useEffect(() => {
    const state = location.state;
    if (state?.startPractice && state?.specificSign) {
      const mode = state.mode || 'recognition';
      startPractice(mode, selectedCategory, difficulty, state.specificSign);
      // Clear the state to avoid re-trigger on back/forward
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, signs]);

  const initializePractice = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchSigns(),
        fetchCategories(),
        fetchRecentAttempts()
      ]);
    } catch {
      setNotification({ type: 'error', message: 'Failed to load practice data' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSigns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dictionary/db/signs?limit=100`);
      const data = await res.json();
      setSigns(data.signs || []);
    } catch (e) {
      console.error('Failed to load signs:', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/content/categories`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        const mapped = data.data.map((c) => ({
          id: c.slug || c._id || c.name,
          name: c.name,
          count: c.signCount || c.count || 0
        }));
        setCategories(mapped);
      } else if (Array.isArray(data?.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  

  const fetchRecentAttempts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/practice/attempts/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRecentAttempts(data.data || []);
    } catch (e) {
      console.error('Failed to load recent attempts:', e);
    }
  };

  const generatePracticeQuestions = (mode, category, difficulty) => {
    let filteredSigns = signs;
    
    if (category !== 'all') {
      filteredSigns = signs.filter(sign => sign.category === category);
    }
    
    // Filter by difficulty (you can implement more sophisticated logic)
    const questionCount = difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 8 : 10;
    const selectedSigns = filteredSigns.slice(0, questionCount);
    
    const generatedQuestions = selectedSigns.map((sign, index) => ({
      id: index + 1,
      sign,
      type: 'recognition', // For now, all recognition type
      question: `Practice the sign for "${sign.word}"`,
      options: generateOptions(sign, filteredSigns),
      correctAnswer: sign.word
    }));
    
    return generatedQuestions;
  };

  const generateOptions = (correctSign, allSigns) => {
    const options = [correctSign.word];
    const otherSigns = allSigns.filter(s => s._id !== correctSign._id);
    
    // Add 3 random incorrect options
    for (let i = 0; i < 3 && i < otherSigns.length; i++) {
      const randomIndex = Math.floor(Math.random() * otherSigns.length);
      options.push(otherSigns[randomIndex].word);
      otherSigns.splice(randomIndex, 1);
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  const startPractice = (mode, category, difficulty, specificSign = null) => {
    if (mode === 'recognition' && specificSign) {
      // Start sign recognition practice session
      const sign = signs.find(s => s._id === specificSign);
      if (sign) {
        setCurrentSession({
          sign,
          mode: 'recognition',
          startTime: new Date()
        });
        return;
      } else {
        setNotification({ type: 'error', message: 'Selected sign not found' });
        return;
      }
    }
    
    let questions;
    
    if (mode === 'free' && specificSign) {
      // For free practice with a specific sign
      const sign = signs.find(s => s._id === specificSign);
      if (sign) {
        questions = [{
          id: 1,
          sign,
          type: 'recognition',
          question: `Practice the sign for "${sign.word}"`,
          options: generateOptions(sign, signs),
          correctAnswer: sign.word
        }];
      } else {
        setNotification({ type: 'error', message: 'Selected sign not found' });
        return;
      }
    } else {
      questions = generatePracticeQuestions(mode, category, difficulty);
    }
    
    setPracticeMode(mode);
    setCurrentLesson({ mode, category, difficulty, specificSign });
    setQuestions(questions);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResult(false);
    setScore(0);
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      evaluatePractice();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const evaluatePractice = async () => {
    setIsEvaluating(true);
    try {
      let totalScore = 0;
      const results = [];
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = userAnswers[i];
        const isCorrect = userAnswer === question.correctAnswer;
        const questionScore = isCorrect ? 100 : 0;
        
        totalScore += questionScore;
        results.push({
          question,
          userAnswer,
          isCorrect,
          score: questionScore
        });
      }
      
      const finalScore = Math.round(totalScore / questions.length);
      setScore(finalScore);
      
      // Update streak and XP
      if (finalScore >= 70) {
        setStreak(prev => prev + 1);
        setXp(prev => prev + (finalScore * 0.1));
        setCompletedLessons(prev => prev + 1);
      } else {
        setStreak(0);
      }
      
      // Update accuracy
      const newAccuracy = ((accuracy * completedLessons) + finalScore) / (completedLessons + 1);
      setAccuracy(newAccuracy);
      
      setShowResult(true);
      setNotification({ 
        type: finalScore >= 70 ? 'success' : 'warning', 
        message: `Practice complete! Score: ${finalScore}%` 
      });
      
    } catch {
      setNotification({ type: 'error', message: 'Failed to evaluate practice' });
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetPractice = () => {
    setCurrentLesson(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResult(false);
    setScore(0);
    setCurrentSession(null);
  };

  const handleSessionComplete = (sessionData) => {
    // Update user progress (client)
    const signId = currentSession.sign._id;
    const newProgress = {
      ...userProgress,
      [signId]: {
        practiceCount: (userProgress[signId]?.practiceCount || 0) + sessionData.attempts.length,
        accuracy: sessionData.averageScore,
        bestScore: Math.max(userProgress[signId]?.bestScore || 0, sessionData.bestScore),
        lastPractice: new Date()
      }
    };
    setUserProgress(newProgress);
    
    // Update global stats
    setCompletedLessons(prev => prev + 1);
    setXp(prev => prev + sessionData.bestScore * 0.1);
    
    setNotification({ 
      type: 'success', 
      message: `Session complete! Best score: ${sessionData.bestScore}%` 
    });
    
    // Persist summary to backend
    try {
      fetch(`${API_BASE_URL}/practice/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          signId,
          progress: newProgress[signId]
        })
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to persist practice summary:', err);
    }

    setCurrentSession(null);
  };

  const handleSessionExit = () => {
    setCurrentSession(null);
  };

  // Auto-hide notifications
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  const renderWithLayout = (content) => (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar - Matching Dashboard */}
      <div className={`${statusBarBg} border-b ${border} px-4 py-3`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Empty space on the left */}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">{streak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{Math.round(xp)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">{completedLessons}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-8 h-8 text-gray-300" />
              <span className="font-semibold">{user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <Sidebar handleLogout={logout} />
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {notification && (
                  <div className={`mb-6 p-4 rounded-xl ${
                    notification.type === 'success'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : notification.type === 'warning'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {notification.message}
                  </div>
                )}
                {content}
              </div>

              {/* Right Sidebar - Practice Tips & Recent Attempts */}
              <div className="w-80 p-4 space-y-4">
                {/* Practice Tips */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <HandRaisedIcon className="w-5 h-5 mr-2 text-green-400" />
                    Practice Tips
                  </h4>
                  <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm space-y-2`}>
                    <li>• Use a plain background and good lighting</li>
                    <li>• Keep both hands fully in frame</li>
                    <li>• Try both Webcam and Upload modes</li>
                    <li>• Practice regularly for best results</li>
                  </ul>
                </div>

                {/* Recent Attempts */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <TrophyIcon className="w-5 h-5 mr-2 text-yellow-400" />
                    Recent Attempts
                  </h4>
                  {recentAttempts.length === 0 ? (
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>No recent practice attempts.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentAttempts.slice(0, 5).map(attempt => (
                        <div key={attempt._id} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-sm">{attempt.sign?.word}</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              attempt.score >= 80 
                                ? 'bg-green-100 text-green-800'
                                : attempt.score >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {attempt.score}%
                            </div>
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(attempt.createdAt).toLocaleDateString()} • {attempt.sign?.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className={`p-4 rounded-lg border ${border}`}>
                  <h4 className="font-semibold mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link to="/dictionary" className="block w-full text-left p-2 hover:bg-gray-700 rounded transition-colors text-sm">
                      📚 Browse Dictionary
                    </Link>
                    <Link to="/quiz" className="block w-full text-left p-2 hover:bg-gray-700 rounded transition-colors text-sm">
                      🧩 Take Quiz
                    </Link>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
    </div>
  );

  if (isLoading) {
    return renderWithLayout(
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading practice...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return renderWithLayout(
      <div className="max-w-4xl mx-auto">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-xl`}>
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-3xl font-bold ${
                  score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {score}%
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                You completed {questions.length} practice questions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6 text-center`}>
                <div className="text-2xl font-bold text-green-500 mb-2">{streak}</div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Day Streak</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6 text-center`}>
                <div className="text-2xl font-bold text-blue-500 mb-2">{Math.round(xp)}</div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total XP</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6 text-center`}>
                <div className="text-2xl font-bold text-purple-500 mb-2">{questions.length}</div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Questions</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetPractice}
                className="px-8 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Back to Practice
              </button>
              <button
                onClick={() => startPractice(practiceMode, selectedCategory, difficulty)}
                className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Practice Again
              </button>
            </div>
          </div>
        </div>
    );
  }

  // Show practice session for sign recognition
  if (currentSession) {
    return renderWithLayout(
      <PracticeSession
        sign={currentSession.sign}
        onComplete={handleSessionComplete}
        onExit={handleSessionExit}
        userProgress={userProgress[currentSession.sign._id] || {}}
      />
    );
  }

  if (currentLesson) {
    const question = questions[currentQuestion];
    
    return renderWithLayout(
      <div className="max-w-4xl mx-auto">
        <PracticeCard
          question={question}
          onAnswer={handleAnswer}
          onNext={nextQuestion}
          onPrevious={previousQuestion}
          currentIndex={currentQuestion}
          totalQuestions={questions.length}
          userAnswer={userAnswers[currentQuestion]}
          isLastQuestion={currentQuestion === questions.length - 1}
        />
      </div>
    );
  }

  // Show unified learning interface by default
  if (useUnifiedLearning) {
    return <UnifiedLearning />;
  }

  return renderWithLayout(
    <div className="space-y-6">
      {/* Section Header - Matching Dashboard Style */}
      <div className="bg-green-500 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard" className="text-white hover:text-gray-200">
            <ArrowUpIcon className="w-5 h-5 rotate-90" />
          </Link>
          <div>
            <h1 className="text-sm font-medium">PRACTICE MODE</h1>
            <h2 className="text-xl font-bold">Master Sign Language</h2>
          </div>
        </div>
      </div>

      {/* Practice Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Webcam Practice */}
        <div className={`p-6 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer group`}>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-blue-500 p-3 rounded-full group-hover:scale-110 transition-transform">
              <CameraIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Webcam Practice</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Real-time recognition</p>
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Practice with your webcam for instant feedback
          </p>
          <button
            onClick={() => startPractice('recognition', selectedCategory, difficulty, selectedSign)}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Start Webcam Practice
          </button>
        </div>

        {/* Image Upload Practice */}
        <div className={`p-6 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer group`}>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-purple-500 p-3 rounded-full group-hover:scale-110 transition-transform">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Image Upload</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Upload & analyze</p>
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Upload images for sign recognition practice
          </p>
          <button
            onClick={() => startPractice('free', selectedCategory, difficulty, selectedSign)}
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
          >
            Upload Image
          </button>
        </div>

        {/* Guided Practice */}
        <div className={`p-6 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer group`}>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-green-500 p-3 rounded-full group-hover:scale-110 transition-transform">
              <PlayIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Guided Practice</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Structured lessons</p>
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Learn with structured lessons and feedback
          </p>
          <button
            onClick={() => startPractice('guided', selectedCategory, difficulty)}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Start Guided Practice
          </button>
        </div>

        {/* Challenge Mode */}
        <div className={`p-6 rounded-lg border ${border} hover:shadow-lg transition-all cursor-pointer group`}>
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-orange-500 p-3 rounded-full group-hover:scale-110 transition-transform">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Challenge Mode</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Timed challenges</p>
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Test your skills with timed challenges
          </p>
          <button
            onClick={() => startPractice('challenge', selectedCategory, difficulty)}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Start Challenge
          </button>
        </div>
      </div>

      {/* Practice Settings */}
      <div className={`p-6 rounded-lg border ${border} mb-6`}>
        <h3 className="text-xl font-bold mb-4">Practice Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="beginner">Beginner (5 questions)</option>
              <option value="intermediate">Intermediate (8 questions)</option>
              <option value="advanced">Advanced (10 questions)</option>
            </select>
          </div>

          <div>
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Select Sign
            </label>
            <select
              value={selectedSign}
              onChange={(e) => setSelectedSign(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="">Choose a specific sign</option>
              {signs.map(sign => (
                <option key={sign._id} value={sign._id}>
                  {sign.word} ({sign.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Switch to Unified Learning */}
      <div className={`p-6 rounded-lg border ${border} text-center`}>
        <h3 className="text-xl font-bold mb-2">Prefer a Different Interface?</h3>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Try our unified learning experience that combines dictionary and practice
        </p>
        <button
          onClick={() => setUseUnifiedLearning(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-semibold"
        >
          Switch to Unified Learning
        </button>
      </div>

    </div>
  );
}

