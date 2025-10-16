import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { useUserStats } from '../hooks/useUserStats';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import SignRecognition from '../components/SignRecognition';
import { 
  BoltIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  ClockIcon,
  TrophyIcon,
  HandRaisedIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Practice() {
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const { stats: userStats } = useUserStats();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Practice state - Duolingo Style
  const [practiceMode, setPracticeMode] = useState('review');
  const [recentSigns, setRecentSigns] = useState([]);
  const [weakSigns, setWeakSigns] = useState([]);
  const [dailyGoal, setDailyGoal] = useState({ completed: 0, target: 5 });
  const [loading, setLoading] = useState(true);
  
  // Practice session state
  const [isPracticeSession, setIsPracticeSession] = useState(false);
  const [currentSign, setCurrentSign] = useState(null);
  const [sessionMode, setSessionMode] = useState('review');
  const [exerciseType, setExerciseType] = useState('sign-recognition');

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  useEffect(() => {
    fetchPracticeData();
    
    // Check if we're in a practice session
    const state = location.state;
    if (state?.startPractice) {
      setIsPracticeSession(true);
      // Handle both sign data formats
      const signData = state.sign || state.signData || { word: state.specificSign || 'Unknown Sign' };
      setCurrentSign(signData);
      setSessionMode(state.mode || 'review');
      setExerciseType(state.exerciseType || 'sign-recognition');
    }
  }, [location.state]);

  const fetchPracticeData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockRecentSigns = [
        { id: 1, word: 'Hello', accuracy: 85, lastPracticed: new Date(), category: 'basics' },
        { id: 2, word: 'Thank you', accuracy: 92, lastPracticed: new Date(), category: 'basics' },
        { id: 3, word: 'Goodbye', accuracy: 78, lastPracticed: new Date(), category: 'basics' },
        { id: 4, word: 'Please', accuracy: 65, lastPracticed: new Date(), category: 'basics' }
      ];
      
      const mockWeakSigns = [
        { id: 5, word: 'Sorry', accuracy: 45, lastPracticed: new Date(), category: 'basics' },
        { id: 6, word: 'Excuse me', accuracy: 52, lastPracticed: new Date(), category: 'basics' },
        { id: 7, word: 'Help', accuracy: 38, lastPracticed: new Date(), category: 'basics' }
      ];
      
      setRecentSigns(mockRecentSigns);
      setWeakSigns(mockWeakSigns);
      setDailyGoal({ completed: 2, target: 5 });
      
    } catch (error) {
      console.error('Error fetching practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startPractice = (sign, mode = 'review', exerciseType = 'sign-recognition') => {
    // Start practice session
    setIsPracticeSession(true);
    setCurrentSign(sign);
    setSessionMode(mode);
    setExerciseType(exerciseType);
  };

  const endPracticeSession = () => {
    setIsPracticeSession(false);
    setCurrentSign(null);
    setSessionMode('review');
    setExerciseType('sign-recognition');
  };

  const handleRecognitionResult = (result) => {
    console.log('Recognition result:', result);
    // Handle the recognition result
    // This could update progress, show feedback, etc.
  };

  const renderExerciseContent = () => {
    switch (exerciseType) {
      case 'sign-recognition':
        return (
          <SignRecognition
            targetSign={currentSign}
            onRecognition={handleRecognitionResult}
            mode="webcam"
          />
        );
      
      case 'flashcard':
        return (
          <div className="text-center space-y-6">
            {/* Show cover image or first variant */}
            <div className="w-64 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto overflow-hidden">
              {currentSign.coverImage ? (
                <img
                  src={currentSign.coverImage}
                  alt={`Sign for ${currentSign.word}`}
                  className="w-full h-full object-cover"
                />
              ) : currentSign.variants && currentSign.variants.length > 0 ? (
                currentSign.variants[0].type === 'image' ? (
                  <img
                    src={currentSign.variants[0].path}
                    alt={`Sign for ${currentSign.word}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={currentSign.variants[0].path}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">Sign Demonstration</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{currentSign.word}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Study this sign and its meaning
              </p>
              {currentSign.variants && currentSign.variants.length > 1 && (
                <p className="text-sm text-blue-600 mb-4">
                  This sign has {currentSign.variants.length} learning variants
                </p>
              )}
              <button
                onClick={() => handleRecognitionResult({ isValid: true, confidence: 0.9 })}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                I understand this sign
              </button>
            </div>
          </div>
        );
      
      case 'video-tutorial':
        return (
          <div className="text-center space-y-6">
            <div className="w-full max-w-md mx-auto">
              <div className="relative bg-black rounded-lg overflow-hidden">
                {currentSign.variants && currentSign.variants.find(v => v.type === 'video') ? (
                  <video
                    src={currentSign.variants.find(v => v.type === 'video').path}
                    className="w-full h-48 object-cover"
                    controls
                    autoPlay
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                    <PlayIcon className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black bg-opacity-50 rounded p-2">
                    <div className="text-white text-sm font-medium">{currentSign.word}</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{currentSign.word}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Watch the video tutorial to learn this sign
              </p>
              {currentSign.variants && currentSign.variants.length > 1 && (
                <p className="text-sm text-blue-600 mb-4">
                  This sign has {currentSign.variants.length} learning variants
                </p>
              )}
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => handleRecognitionResult({ isValid: true, confidence: 0.9 })}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  I learned this sign
                </button>
                <button
                  onClick={() => handleRecognitionResult({ isValid: false, confidence: 0.3 })}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Need more practice
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <SignRecognition
            targetSign={currentSign}
            onRecognition={handleRecognitionResult}
            mode="webcam"
          />
        );
    }
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

  // Practice Session View
  if (isPracticeSession && currentSign) {
    return (
      <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
        {/* Top Status Bar */}
        <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
                <button
                onClick={endPracticeSession}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                <span>←</span>
                <span>Back to Practice</span>
                </button>
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
                  {/* Practice Session Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className={`text-3xl font-bold ${text} mb-2`}>Practice Session</h1>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Practice the sign for "{currentSign.word}"
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          sessionMode === 'review' ? 'bg-blue-100 text-blue-800' :
                          sessionMode === 'weak' ? 'bg-red-100 text-red-800' :
                          sessionMode === 'speed' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {sessionMode.charAt(0).toUpperCase() + sessionMode.slice(1)} Mode
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          exerciseType === 'sign-recognition' ? 'bg-blue-100 text-blue-800' :
                          exerciseType === 'flashcard' ? 'bg-green-100 text-green-800' :
                          exerciseType === 'video-tutorial' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exerciseType === 'sign-recognition' ? '👁️ Recognition' :
                           exerciseType === 'flashcard' ? '📚 Flashcard' :
                           exerciseType === 'video-tutorial' ? '▶️ Tutorial' :
                           exerciseType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sign Recognition Component */}
                  <div className={`${cardBg} rounded-lg border ${border} p-6`}>
                    <div className="text-center mb-6">
                      <h2 className={`text-2xl font-bold ${text} mb-2`}>
                        Practice: {currentSign.word}
                      </h2>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Show this sign to the camera
                      </p>
                    </div>

                    {renderExerciseContent()}
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

                {/* Daily Goal - Duolingo Style */}
                <div className={`${cardBg} rounded-lg border ${border} p-6 mb-8`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${text}`}>Today's Practice Goal</h3>
                    <span className="text-sm text-gray-500">
                      {dailyGoal.completed} / {dailyGoal.target} signs practiced
                    </span>
          </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(dailyGoal.completed / dailyGoal.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Keep practicing to maintain your streak!</span>
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
                      {recentSigns.map((sign) => (
                        <div
                          key={sign.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getAccuracyBg(sign.accuracy)}`}>
                              <CheckCircleIcon className={`w-5 h-5 ${getAccuracyColor(sign.accuracy)}`} />
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
                            <div className="flex space-x-1">
                              <button
                                onClick={() => startPractice(sign, 'review', 'sign-recognition')}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                title="Sign Recognition"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => startPractice(sign, 'review', 'flashcard')}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                title="Flashcard"
                              >
                                📚
                              </button>
                              <button
                                onClick={() => startPractice(sign, 'review', 'video-tutorial')}
                                className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                                title="Video Tutorial"
                              >
                                ▶️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                            <div className="flex space-x-1">
                              <button
                                onClick={() => startPractice(sign, 'weak', 'sign-recognition')}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                                title="Sign Recognition"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => startPractice(sign, 'weak', 'flashcard')}
                                className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                                title="Flashcard"
                              >
                                📚
                              </button>
                              <button
                                onClick={() => startPractice(sign, 'weak', 'video-tutorial')}
                                className="px-2 py-1 bg-pink-500 text-white rounded text-xs hover:bg-pink-600 transition-colors"
                                title="Video Tutorial"
                              >
                                ▶️
                              </button>
                            </div>
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
                      className={`p-4 rounded-lg border transition-all ${
                        practiceMode === 'review' 
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
                      className={`p-4 rounded-lg border transition-all ${
                        practiceMode === 'speed' 
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
                      className={`p-4 rounded-lg border transition-all ${
                        practiceMode === 'accuracy' 
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