import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import SignRecognition from './SignRecognition';
import LearningProgression from './LearningProgression';

const API_BASE_URL = 'http://localhost:5000/api';

export default function LearningFlow({ 
  selectedSign, 
  onBack, 
  userProgress = {} 
}) {
  const { darkMode } = useTheme();
  const { token } = useAuth();
  
  // Learning flow states
  const [currentStep, setCurrentStep] = useState('learn'); // 'learn', 'practice', 'master'
  const [sessionData, setSessionData] = useState({
    attempts: [],
    startTime: new Date(),
    bestScore: 0,
    averageScore: 0,
    totalTime: 0
  });
  const [isActive, setActive] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [showProgression, setShowProgression] = useState(false);
  const [userStats, setUserStats] = useState({
    practiceCount: 0,
    accuracy: 0,
    bestScore: 0,
    level: 1
  });

  // Initialize user stats
  useEffect(() => {
    if (selectedSign && userProgress[selectedSign._id]) {
      setUserStats(userProgress[selectedSign._id]);
    }
  }, [selectedSign, userProgress]);

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

    setRecognitionResult(result);
    
    // Auto-advance to next step if score is good
    if (result.confidence >= 80 && currentStep === 'learn') {
      setTimeout(() => {
        setCurrentStep('practice');
      }, 2000);
    } else if (result.confidence >= 90 && currentStep === 'practice') {
      setTimeout(() => {
        setCurrentStep('master');
      }, 2000);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'learn': return 'Learn the Sign';
      case 'practice': return 'Practice the Sign';
      case 'master': return 'Master the Sign';
      default: return 'Learn the Sign';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'learn': return 'Watch and understand the sign for ' + selectedSign.word;
      case 'practice': return 'Practice the sign until you get it right';
      case 'master': return 'Perfect your sign with advanced practice';
      default: return 'Learn the sign for ' + selectedSign.word;
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'learn': return '👀';
      case 'practice': return '🤟';
      case 'master': return '🏆';
      default: return '👀';
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = 3;
    const currentStepIndex = ['learn', 'practice', 'master'].indexOf(currentStep);
    return ((currentStepIndex + 1) / totalSteps) * 100;
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
    setRecognitionResult(null);
  };

  const handleComplete = async () => {
    // Update user progress
    const signId = selectedSign._id;
    const newProgress = {
      ...userProgress,
      [signId]: {
        practiceCount: (userProgress[signId]?.practiceCount || 0) + sessionData.attempts.length,
        accuracy: sessionData.averageScore,
        bestScore: Math.max(userProgress[signId]?.bestScore || 0, sessionData.bestScore),
        lastPractice: new Date(),
        level: sessionData.bestScore >= 90 ? 4 : sessionData.bestScore >= 75 ? 3 : sessionData.bestScore >= 60 ? 2 : 1
      }
    };
    
    // Save progress to backend
    try {
      await fetch(`${API_BASE_URL}/practice/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          signId,
          progress: newProgress[signId]
        })
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
    
    onBack();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#1A1A1A]' : 'bg-white'} ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
      {/* Top Status Bar */}
      <div className={`${darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'} px-4 py-3`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back to Learning</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">7</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">1250</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">5</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">User</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <div className="w-64 bg-[#1A1A1A] border-r border-gray-700">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">{selectedSign.word}</h2>
              <p className="text-gray-400 text-sm">{selectedSign.category}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${darkMode ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6">
                {/* Section Header */}
                <div className="bg-green-500 text-white p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h1 className="text-sm font-medium">LEARNING SESSION</h1>
                        <h2 className="text-xl font-bold">Practice "{selectedSign.word}"</h2>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setShowProgression(!showProgression)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {showProgression ? 'Hide' : 'Show'} Progress
                      </button>
                      <button
                        onClick={handleComplete}
                        className="px-4 py-2 bg-white text-green-500 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Main Learning Area */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Progress Steps */}
                    <div className={`${darkMode ? 'bg-[#23272F]' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">{getStepTitle()}</h2>
                        <span className="text-2xl">{getStepIcon()}</span>
                      </div>
                      
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                        {getStepDescription()}
                      </p>

                      {/* Step Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm">{Math.round(getProgressPercentage())}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercentage()}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Step Navigation */}
                      <div className="flex space-x-2">
                        {['learn', 'practice', 'master'].map((step, index) => (
                          <button
                            key={step}
                            onClick={() => handleStepChange(step)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              currentStep === step
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {step.charAt(0).toUpperCase() + step.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sign Display */}
                    <div className={`${darkMode ? 'bg-[#23272F]' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} p-0`}>
                      <div className="flex">
                        {['webcam','upload'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActive(true)}
                            className={`flex-1 py-3 md:py-4 text-sm md:text-base font-semibold rounded-t-lg bg-green-500 text-white`}
                          >
                            {tab === 'webcam' ? '📹 Webcam' : '📷 Upload'}
                          </button>
                        ))}
                      </div>
                      <div className="p-6">
                        <div className="text-center mb-6">
                          <div className="text-8xl mb-4">🤟</div>
                          <h3 className="text-3xl font-bold text-green-500 mb-2">
                            {selectedSign.word}
                          </h3>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Show this sign to the camera or upload an image
                          </p>
                        </div>

                        {/* Sign Recognition */}
                        <SignRecognition
                          targetSign={selectedSign}
                          onRecognition={handleRecognition}
                          mode="webcam"
                          isActive={isActive}
                        />
                      </div>
                    </div>

                    {/* Recognition Result */}
                    {recognitionResult && (
                      <div className={`${darkMode ? 'bg-[#23272F]' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} p-6`}>
                        <div className={`p-4 rounded-lg ${
                          recognitionResult.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              {recognitionResult.isCorrect ? '✅ Great!' : '⚠️ Keep trying!'}
                            </span>
                            <span className="text-lg font-bold">
                              {recognitionResult.confidence}% Confidence
                            </span>
                          </div>
                          <p>{recognitionResult.feedback}</p>
                        </div>

                        {/* Improvement Suggestions */}
                        {recognitionResult.improvements.length > 0 && (
                          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">💡 Tips:</h4>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                              {recognitionResult.improvements.map((tip, index) => (
                                <li key={index}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4 lg:space-y-6 lg:sticky lg:top-6 self-start">
                    {/* Session Stats */}
                    <div className={`${darkMode ? 'bg-[#23272F]' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} p-6`}>
                      <h3 className="text-xl font-bold mb-4">Session Stats</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Attempts:</span>
                          <span className="font-semibold">{sessionData.attempts.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Best Score:</span>
                          <span className="font-semibold text-green-500">{sessionData.bestScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average:</span>
                          <span className="font-semibold text-blue-500">{sessionData.averageScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time:</span>
                          <span className="font-semibold">{Math.round(sessionData.totalTime / 60)}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Learning Progression */}
                    {showProgression && (
                      <LearningProgression
                        sign={selectedSign}
                        userProgress={userStats}
                        onProgressUpdate={(progress) => {
                          setUserStats(progress);
                        }}
                      />
                    )}

                    {/* Practice Controls */}
                    <div className={`${darkMode ? 'bg-[#23272F]' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} p-6`}>
                      <h3 className="text-xl font-bold mb-4">Practice Controls</h3>
                      <div className="space-y-4">
                        <button
                          onClick={() => setActive(!isActive)}
                          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                            isActive
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {isActive ? '⏸️ Pause' : '▶️ Start'} Practice
                        </button>
                        
                        <button
                          onClick={() => setRecognitionResult(null)}
                          className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Clear Results
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}