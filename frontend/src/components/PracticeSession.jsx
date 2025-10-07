import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import SignRecognition from './SignRecognition';
import LearningProgression from './LearningProgression';

export default function PracticeSession({ 
  sign, 
  onComplete, 
  onExit,
  userProgress = {}
}) {
  const { darkMode } = useTheme();
  const [currentMode, setCurrentMode] = useState('webcam'); // 'webcam' | 'upload'
  const [sessionData, setSessionData] = useState({
    attempts: [],
    startTime: new Date(),
    totalTime: 0,
    bestScore: 0,
    averageScore: 0
  });
  const [isActive, setIsActive] = useState(false);
  const [showProgression, setShowProgression] = useState(false);

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

  const handleComplete = () => {
    const finalData = {
      ...sessionData,
      endTime: new Date(),
      totalTime: Math.round((new Date() - sessionData.startTime) / 1000)
    };
    
    onComplete(finalData);
  };

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

  return (
    <div className={`${darkMode ? 'bg-[#0F1216]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${darkMode ? 'bg-[#1A1F2B]' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-6 mb-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🤟</div>
                <h1 className="text-2xl md:text-3xl font-bold">Practice: <span className="text-green-500">{sign.word}</span></h1>
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                Choose Webcam or Upload and start practicing. Live stats update as you go.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProgression(!showProgression)}
                className="px-4 py-2 rounded-xl border border-transparent bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                {showProgression ? 'Hide Progress' : 'Show Progress'}
              </button>
              <button
                onClick={onExit}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} px-4 py-2 rounded-xl transition-colors`}
              >
                Exit
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Main Practice Area */}
          <div className="lg:col-span-8 space-y-4 lg:space-y-6">
            {/* Tabs */}
            <div className={`${darkMode ? 'bg-[#1A1F2B]' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-0 shadow-sm`}> 
              <div className="flex">
                {['webcam','upload'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCurrentMode(tab)}
                    className={`flex-1 py-3 md:py-4 text-sm md:text-base font-semibold rounded-t-2xl ${
                      currentMode === tab
                        ? 'bg-green-500 text-white'
                        : `${darkMode ? 'text-gray-300' : 'text-gray-600'}`
                    }`}
                  >
                    {tab === 'webcam' ? '📹 Webcam' : '📷 Upload'}
                  </button>
                ))}
              </div>
              <div className="p-6">
                <SignRecognition
                  targetSign={sign}
                  onRecognition={handleRecognition}
                  mode={currentMode}
                  isActive={isActive}
                />
              </div>
            </div>

            {/* Controls */}
            <div className={`${darkMode ? 'bg-[#1A1F2B]' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-4 lg:p-6 shadow-sm`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 lg:gap-3">
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isActive ? 'Recognition is running...' : 'Press Start to begin automatic captures.'}
                </div>
                <div className="flex gap-2 lg:gap-3">
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                      isActive
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isActive ? '⏸️ Pause' : '▶️ Start'}
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={sessionData.attempts.length === 0}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                      sessionData.attempts.length === 0
                        ? 'bg-gray-400 text-white opacity-60 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
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
            <div className={`${darkMode ? 'bg-[#1A1F2B]' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-4 lg:p-6 shadow-sm`}>
              <h3 className="text-lg font-bold mb-4">Sign Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Word</span><span className="font-semibold">{sign.word}</span></div>
                <div className="flex justify-between"><span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category</span><span className="font-semibold capitalize">{sign.category}</span></div>
              </div>
            </div>

            {/* Coaching Assistant */}
            <div className={`${darkMode ? 'bg-[#1A1F2B]' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-4 lg:p-6 shadow-sm`}>
              <h3 className="text-lg font-bold mb-3">Assistant</h3>
              {sessionData.attempts.length === 0 ? (
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Start a capture to receive targeted tips.</p>
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
                      <div key={i} className={`${darkMode ? 'bg-gray-800/40' : 'bg-gray-50'} p-2 rounded`}>💡 {t}</div>
                    )) : <div className={`${darkMode ? 'bg-gray-800/40' : 'bg-gray-50'} p-2 rounded`}>✅ Looking good! Try for a higher score.</div>;
                  })()}
                </div>
              )}
            </div>

            {/* Session Stats */}
            <div className={`${darkMode ? 'bg-[#1A1F2B]' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-4 lg:p-6 shadow-sm`}>
              <h3 className="text-lg font-bold mb-4">Session Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <div className="text-xs opacity-70">Best</div>
                  <div className="text-lg font-semibold text-green-500">{stats.bestScore}%</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <div className="text-xs opacity-70">Average</div>
                  <div className="text-lg font-semibold text-blue-500">{stats.averageScore}%</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <div className="text-xs opacity-70">Attempts</div>
                  <div className="text-lg font-semibold text-purple-500">{stats.totalAttempts}</div>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <div className="text-xs opacity-70">Time</div>
                  <div className="text-lg font-semibold text-orange-500">{stats.totalTime}m</div>
                </div>
              </div>
            </div>

            {/* Recent Attempts */}
            {sessionData.attempts.length > 0 && (
              <div className={`${darkMode ? 'bg-[#1A1F2B]' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-4 lg:p-6 shadow-sm`}>
                <h3 className="text-lg font-bold mb-4">Recent Attempts</h3>
                <div className="space-y-3">
                  {sessionData.attempts.slice(-5).reverse().map(attempt => (
                    <div key={attempt.id} className={`${darkMode ? 'bg-gray-800/40' : 'bg-gray-50'} p-3 rounded-lg`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{attempt.confidence}%</span>
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
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
                sign={sign}
                userProgress={userProgress}
                onProgressUpdate={(progress) => {
                  console.log('Progress updated:', progress);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}