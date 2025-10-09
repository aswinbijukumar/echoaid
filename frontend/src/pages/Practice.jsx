import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import SignRecognition from '../components/SignRecognition';
import SignLearningChatbot from '../components/SignLearningChatbot';
import LearningProgression from '../components/LearningProgression';
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
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Practice() {
  const { token } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  
  // Practice state
  const [currentMode, setCurrentMode] = useState('webcam'); // 'webcam' | 'upload'
  const [selectedSign, setSelectedSign] = useState(null);
  const [sessionData, setSessionData] = useState({
    attempts: [],
    startTime: new Date(),
    totalTime: 0,
    bestScore: 0,
    averageScore: 0
  });
  const [isActive, setIsActive] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  // Data state
  const [signs, setSigns] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress] = useState({});

  useEffect(() => {
    initializePractice();
  }, [token]);

  // Restore selected sign from localStorage on page load (for page refreshes)
  useEffect(() => {
    const savedSignData = localStorage.getItem('practiceSelectedSign');
    if (savedSignData && !selectedSign) {
      try {
        const { specificSign, signData } = JSON.parse(savedSignData);
        console.log('Practice page - restoring from localStorage:', { specificSign, signData });
        
        if (signData) {
          // Use the saved sign data directly
          setSelectedSign(signData);
          setIsActive(true);
        } else if (signs.length > 0) {
          // Try to find the sign in loaded signs
          const sign = signs.find(s => s._id === specificSign || s.id === specificSign);
          if (sign) {
            setSelectedSign(sign);
            setIsActive(true);
          }
        }
      } catch (error) {
        console.error('Error parsing saved sign data:', error);
        localStorage.removeItem('practiceSelectedSign');
      }
    }
  }, [signs, selectedSign]);

  // Auto-start session if navigated with state from Dictionary
  useEffect(() => {
    const state = location.state;
    console.log('Practice page - location.state:', state);
    console.log('Practice page - signs loaded:', signs.length);
    
    if (state?.startPractice && state?.specificSign) {
      // Store the sign data in localStorage for persistence
      localStorage.setItem('practiceSelectedSign', JSON.stringify({
        specificSign: state.specificSign,
        signData: state.signData
      }));
      
      // Try to find the sign in the loaded signs
      if (signs.length > 0) {
        const sign = signs.find(s => s._id === state.specificSign || s.id === state.specificSign);
        console.log('Practice page - found sign:', sign);
        if (sign) {
          setSelectedSign(sign);
          setIsActive(true);
          // Clear the state to avoid re-trigger on back/forward
          window.history.replaceState({}, document.title);
        } else {
          console.log('Practice page - sign not found with ID:', state.specificSign);
          console.log('Available signs:', signs.map(s => ({ id: s._id, word: s.word })));
          // Use the direct sign data if available
          if (state.signData) {
            setSelectedSign(state.signData);
            setIsActive(true);
          } else {
            // Create a temporary sign object if not found
            setSelectedSign({
              _id: state.specificSign,
              word: 'Unknown Sign',
              category: 'Unknown'
            });
            setIsActive(true);
            setNotification({ 
              type: 'warning', 
              message: 'Sign not found in database. Using fallback data.' 
            });
          }
        }
      } else {
        console.log('Practice page - signs not loaded yet, creating temporary sign');
        // Use direct sign data if available, otherwise create temporary sign
        if (state.signData) {
          setSelectedSign(state.signData);
        } else {
          setSelectedSign({
            _id: state.specificSign,
            word: 'Loading...',
            category: 'Loading...'
          });
        }
        setIsActive(true);
      }
    }
  }, [location.state, signs]);

  // Handle direct sign data from Dictionary (fallback)
  useEffect(() => {
    const state = location.state;
    if (state?.startPractice && state?.signData && !selectedSign) {
      console.log('Practice page - using direct sign data:', state.signData);
      setSelectedSign(state.signData);
      setIsActive(true);
      // Clear the state to avoid re-trigger on back/forward
      window.history.replaceState({}, document.title);
    }
  }, [location.state, selectedSign]);

  // Update selectedSign when signs load and we have a temporary sign
  useEffect(() => {
    if (selectedSign && selectedSign.word === 'Loading...' && signs.length > 0) {
      const state = location.state;
      if (state?.specificSign) {
        const sign = signs.find(s => s._id === state.specificSign || s.id === state.specificSign);
        if (sign) {
          console.log('Practice page - updating from temporary to real sign:', sign);
          setSelectedSign(sign);
        }
      }
    }
  }, [signs, selectedSign, location.state]);

  // Handle recognition results
  const handleRecognition = (result) => {
    const newAttempt = {
      id: Date.now(),
      timestamp: new Date(),
      confidence: result.confidence,
      isCorrect: result.isCorrect,
      feedback: result.feedback,
      landmarks: result.landmarks,
      improvements: result.improvements
    };

    setSessionData(prev => {
      const newAttempts = [...prev.attempts, newAttempt];
      const scores = newAttempts.map(a => a.confidence);
      const bestScore = Math.max(...scores);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      return {
        ...prev,
        attempts: newAttempts,
        bestScore,
        averageScore: Math.round(averageScore),
        totalTime: Math.round((new Date() - prev.startTime) / 1000)
      };
    });
  };

  // Complete session
  const handleComplete = async () => {
    const finalData = {
      ...sessionData,
      endTime: new Date(),
      totalTime: Math.round((new Date() - sessionData.startTime) / 1000)
    };
    
    // Save progress
    if (selectedSign && token) {
      try {
        const progress = {
          practiceCount: finalData.attempts?.length || 0,
          accuracy: finalData.averageScore || 0,
          bestScore: finalData.bestScore || 0,
          lastPractice: new Date()
        };

        await fetch(`${API_BASE_URL}/practice/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            signId: selectedSign._id,
            progress
          })
        });
      } catch (error) {
        console.error('Failed to save practice progress', error);
      }
    }

    // Reset session
    cleanupSession();
    
    setNotification({ 
      type: 'success', 
      message: `Session complete! Best score: ${finalData.bestScore}%` 
    });
  };

  // Clean up practice session data
  const cleanupSession = () => {
    setSelectedSign(null);
    setSessionData({
      attempts: [],
      startTime: new Date(),
      totalTime: 0,
      bestScore: 0,
      averageScore: 0
    });
    setIsActive(false);
    // Clear the saved sign data
    localStorage.removeItem('practiceSelectedSign');
    // Clear any browser history state to prevent re-triggering
    window.history.replaceState({}, document.title);
  };

  const initializePractice = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dictionary/db/signs?limit=100`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.signs && Array.isArray(data.signs)) {
        setSigns(data.signs);
      } else {
        console.warn('No signs data received from API');
        setSigns([]);
      }
    } catch (e) {
      console.error('Failed to load signs:', e);
      setNotification({ 
        type: 'error', 
        message: `Failed to load practice data: ${e.message}` 
      });
      setSigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-hide notifications
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  // Get session stats
  const getSessionStats = () => {
    const { attempts, bestScore, averageScore, totalTime } = sessionData;
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const accuracy = attempts.length > 0 ? Math.round((correctAttempts / attempts.length) * 100) : 0;
    
    return {
      totalAttempts: attempts.length,
      correctAttempts,
      accuracy,
      bestScore,
      averageScore,
      totalTime: Math.round(totalTime / 60) // minutes
    };
  };

  const stats = getSessionStats();
  const bg = darkMode ? 'bg-[#0F1216]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  const cardBg = 'bg-transparent';

  if (isLoading) {
    return (
      <div className={`${bg} min-h-screen p-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-lg">Loading practice...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no signs are available
  if (!isLoading && signs.length === 0) {
    return (
      <div className={`${bg} min-h-screen p-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4">No Signs Available</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unable to load practice signs. Please check your connection and try again.
              </p>
              <div className="space-x-4">
                <button
                  onClick={initializePractice}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
                <Link
                  to="/dictionary"
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors inline-block"
                >
                  Go to Dictionary
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Practice page content (overlay content as main page)
  return (
    <div className={`${bg} min-h-screen p-6`}>
      <div className="max-w-7xl xl:max-w-[1400px] mx-auto">
        {/* Notifications */}
        {notification && (
          <div className={`mb-4 p-4 rounded-xl border ${
            notification.type === 'success'
              ? 'border-green-500/40 text-green-400'
              : notification.type === 'error'
              ? 'border-red-500/40 text-red-400'
              : notification.type === 'warning'
              ? 'border-yellow-500/40 text-yellow-400'
              : 'border-blue-500/40 text-blue-400'
          } bg-transparent` }>
            <div className="flex items-center justify-between">
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`${cardBg} border ${border} rounded-2xl p-6 mb-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🤟</div>
                <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedSign ? `Practice: ${selectedSign.word}` : 'Practice Sign Language'}
                </h1>
              </div>
              <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mt-1`}>
                {selectedSign 
                  ? `Practice the sign "${selectedSign.word}" with webcam or upload. Recognition is running automatically!`
                  : 'Practice any sign with webcam or upload. Recognition system is ready!'
                }
              </p>
              {selectedSign && selectedSign.word === 'Loading...' && (
                <p className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} text-sm mt-2`}>
                  Loading sign data...
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProgression(!showProgression)}
                className="px-4 py-2 rounded-xl border border-transparent bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
              >
                {showProgression ? 'Hide Progress' : 'Show Progress'}
              </button>
              <Link
                to="/dictionary"
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors font-medium flex items-center gap-2"
                title="Back to Dictionary"
              >
                <BookOpenIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Dictionary</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Always show the recognition interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Main Practice Area */}
            <div className="lg:col-span-8 space-y-4 lg:space-y-6">
              {/* Tabs */}
              <div className={`${cardBg} border ${border} rounded-2xl p-0 shadow-sm`}> 
                <div className="flex">
                  {['webcam','upload'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCurrentMode(tab)}
                  className={`flex-1 py-3 md:py-4 text-sm md:text-base font-semibold rounded-t-2xl transition-colors ${
                    currentMode === tab
                      ? 'bg-green-500 text-white'
                      : `${darkMode ? 'text-gray-300' : 'text-gray-600'}`
                  }`}
                    >
                      {tab === 'webcam' ? '📹 Webcam' : '📤 Upload'}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  <SignRecognition
                    targetSign={selectedSign}
                    onRecognition={handleRecognition}
                    mode={currentMode}
                  />
                </div>
              </div>

            {/* Controls */}
            <div className={`${cardBg} border ${border} rounded-2xl p-4 lg:p-6 shadow-sm`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 lg:gap-3">
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  {isActive ? 'Recognition is running...' : 'Press Start to begin automatic captures.'}
                </div>
                <div className="flex gap-2 lg:gap-3">
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isActive
                        ? 'bg-red-500 text-white hover:bg-red-600 transform hover:scale-105'
                        : 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
                    }`}
                  >
                    {isActive ? '⏸️ Pause' : '▶️ Start'}
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={sessionData.attempts.length === 0}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                      sessionData.attempts.length === 0
                        ? 'bg-gray-400 text-white opacity-60 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105'
                    }`}
                  >
                    ✅ Complete Session
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6 lg:sticky lg:top-6 self-start">
            {/* Sign Details */}
            {selectedSign && (
              <div className={`${cardBg} border ${border} rounded-2xl p-4 lg:p-6 shadow-sm`}>
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Sign Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 px-3 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Word</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">{selectedSign.word}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Category</span>
                    <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">{selectedSign.category}</span>
                  </div>
                </div>
              </div>
            )}

              {/* Coaching Assistant */}
              <div className={`${cardBg} border ${border} rounded-2xl p-4 lg:p-6 shadow-sm`}>
                <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  Assistant
                </h3>
                {sessionData.attempts.length === 0 ? (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm p-3 rounded-lg border border-blue-500/40 bg-transparent`}>
                    Start a capture to receive targeted tips.
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const last = sessionData.attempts[sessionData.attempts.length - 1];
                      const tips = [];
                      if (last.confidence < 75) tips.push('Focus on precise hand shape for better accuracy.');
                      if (last.landmarks?.position === 'needs_adjustment') tips.push('Adjust hand position relative to your torso.');
                      if (last.landmarks?.orientation === 'needs_adjustment') tips.push('Rotate wrist to match the reference orientation.');
                      if (last.landmarks?.movement === 'needs_adjustment') tips.push('Smooth out the movement pattern of the sign.');
                      return tips.length ? tips.map((t, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${darkMode ? 'border-yellow-500/40 text-yellow-400' : 'border-yellow-400 text-yellow-700'} bg-transparent`}>
                          <span className="text-yellow-600 dark:text-yellow-400">💡</span> <span className="ml-2">{t}</span>
                        </div>
                      )) : <div className={`p-3 rounded-lg border ${darkMode ? 'border-green-500/40 text-green-300' : 'border-green-400 text-green-700'} bg-transparent`}>
                        <span className="text-green-600 dark:text-green-400">✅</span> <span className="ml-2">Looking good! Try for a higher score.</span>
                      </div>;
                    })()}
                  </div>
                )}
              </div>

              {/* Session Stats */}
              <div className={`${cardBg} border ${border} rounded-2xl p-4 lg:p-6 shadow-sm`}>
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Session Stats
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-transparent">
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Best</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.bestScore}%</div>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-transparent">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Average</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.averageScore}%</div>
                  </div>
                  <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-transparent">
                    <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Attempts</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalAttempts}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-transparent">
                    <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">Time</div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalTime}m</div>
                  </div>
                </div>
              </div>

              {/* Recent Attempts */}
              {sessionData.attempts.length > 0 && (
                <div className={`${cardBg} border ${border} rounded-2xl p-4 lg:p-6 shadow-sm`}>
                  <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Recent Attempts
                  </h3>
                  <div className="space-y-3">
                    {sessionData.attempts.slice(-5).reverse().map(attempt => (
                      <div key={attempt.id} className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'} bg-transparent`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-lg font-bold ${
                            attempt.confidence >= 80 ? 'text-green-600 dark:text-green-400' :
                            attempt.confidence >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {attempt.confidence}%
                          </span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs font-medium`}>
                            {new Date(attempt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{attempt.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Progression */}
              {showProgression && (
                <LearningProgression
                  sign={selectedSign}
                  userProgress={userProgress[selectedSign._id] || {}}
                  onProgressUpdate={(progress) => {
                    console.log('Progress updated:', progress);
                  }}
                />
              )}
            </div>
          </div>
      </div>
      <BackToTop />
    </div>
  );
}

