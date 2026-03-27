import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import SignRecognition from './SignRecognition'; // Integrated the ML Component
import { ArrowLeftIcon, SignalIcon, ClockIcon, TrophyIcon, ArrowPathIcon } from '@heroicons/react/24/solid';


export default function LearningFlow({
  selectedSign,
  onBack,
  onComplete, // New prop for completion callback
  userProgress = {}
}) {
  const { darkMode } = useTheme();
  const { token } = useAuth();

  const [currentStep, setCurrentStep] = useState('easy'); // easy -> medium -> hard
  const [sessionData, setSessionData] = useState({
    attempts: [],
    startTime: new Date(),
    bestScore: 0,
    averageScore: 0
  });

  const [recognitionResult, setRecognitionResult] = useState(null);

  // --- Session Logic ---
  const handleRecognition = (result) => {
    // Only process valid results
    if (!result || !result.confidence) return;

    setRecognitionResult(result);

    // Update Session Stats
    setSessionData(prev => {
      const newAttempts = [...prev.attempts, result];
      const scores = newAttempts.map(a => a.confidence);
      return {
        ...prev,
        attempts: newAttempts,
        bestScore: Math.max(prev.bestScore, result.confidence),
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      };
    });

    // Auto-advance Logic (Simple Gamification)
    if (result.isCorrect) {
      if (currentStep === 'easy' && result.confidence > 80) setTimeout(() => setCurrentStep('medium'), 1500);
      if (currentStep === 'medium' && result.confidence > 90) setTimeout(() => setCurrentStep('hard'), 1500);
    }
  };

  const handleComplete = async () => {
    // Save all valid attempts to backend
    try {
      if (sessionData.attempts.length > 0) {
        // We can save the best attempt or all of them. For now, let's save the best one if it's good enough
        // or just mark the session complete if we have a robust session endpoint.
        // Since we only have /practice/attempt, let's save the best successful result.

        const bestAttempt = sessionData.attempts.reduce((prev, current) =>
          (prev.confidence > current.confidence) ? prev : current
          , sessionData.attempts[0]);

        if (bestAttempt && (bestAttempt.isCorrect || bestAttempt.confidence > 0.8)) {
          await fetch(`${API_BASE_URL}/practice/attempt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              signId: selectedSign._id || selectedSign.id,
              word: selectedSign.word,
              correct: true,
              confidence: bestAttempt.confidence,
              mode: 'webcam-flow'
            })
          });
        }
      }
    } catch (error) {
      console.error("Failed to save session:", error);
    } finally {
      // Notify parent to refresh data
      if (userProgress && userProgress.onRefresh) {
        userProgress.onRefresh();
      }
      if (onComplete) {
        onComplete();
      }
      onBack(true); // associated with refresh
    }
  };

  return (
    <div className={`min-h-screen relative text-white bg-transparent p-6`}>
      {/* BACKGROUND IS HANDLED BY APP CONTENT (StarField) */}

      {/* Header (Floating Glass) */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <div className="px-6 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full font-mono text-blue-300">
          Target: <span className="text-white font-bold text-xl ml-2">{selectedSign.word}</span>
        </div>

        <button
          onClick={handleComplete}
          className="px-4 py-2 bg-green-500/80 backdrop-blur-md rounded-full hover:bg-green-500 transition-all font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          Complete Session
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="flex h-[85vh] mt-20 gap-6">

        {/* LEFT PANEL: Instructions & Steps */}
        <div className="w-1/4 flex flex-col gap-4">
          {/* Step Card */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2">Current Level</h3>
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white mb-4">
              {currentStep.toUpperCase()}
            </div>

            <div className="space-y-4">
              <StepIndicator step="easy" current={currentStep} label="1. Basic Shape" />
              <StepIndicator step="medium" current={currentStep} label="2. Hold Steady" />
              <StepIndicator step="hard" current={currentStep} label="3. Perfect Angle" />
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-sm text-gray-300 leading-relaxed">
                {currentStep === 'easy' && "Focus on getting the general hand shape correct. Don't worry about perfect angles yet."}
                {currentStep === 'medium' && "Hold the sign steady for at least 3 seconds. Watch your finger alignment."}
                {currentStep === 'hard' && "Perfect your rotation and finger spacing. You need >90% accuracy."}
              </p>
            </div>
          </div>

          {/* Stats Mini Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <SignalIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{sessionData.bestScore}%</div>
              <div className="text-xs text-gray-500">Best Accuracy</div>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <TrophyIcon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">{sessionData.attempts.length}</div>
              <div className="text-xs text-gray-500">Attempts</div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Camera / ML */}
        <div className="flex-1 bg-black/50 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
          {/* The Recognition Component */}
          <div className="h-full w-full flex flex-col">
            <SignRecognition
              targetSign={selectedSign}
              onRecognition={handleRecognition}
              mode="webcam"
            />
          </div>
        </div>

        {/* RIGHT PANEL: Live Feedback */}
        <div className="w-1/4 flex flex-col gap-4">
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full relative overflow-hidden">
            <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-4">AI Tutor Feedback</h3>

            {recognitionResult ? (
              <div className="animate-fade-in">
                <div className={`text-4xl font-bold mb-2 ${recognitionResult.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {recognitionResult.isCorrect ? 'Perfect!' : 'Adjust...'}
                </div>
                <div className="text-6xl font-mono opacity-20 absolute top-4 right-4">{recognitionResult.confidence}</div>

                <div className="mt-6 space-y-3">
                  {recognitionResult.feedback && (
                    <div className="p-3 bg-white/5 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-lg text-blue-200">{recognitionResult.feedback}</p>
                    </div>
                  )}

                  {/* Detailed tips from geometry engine */}
                  {recognitionResult.improvements?.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <ArrowPathIcon className="w-4 h-4 mt-1 text-yellow-500 shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                <div className="text-6xl mb-4">✋</div>
                <p>Waiting for hand...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const StepIndicator = ({ step, current, label }) => {
  const steps = ['easy', 'medium', 'hard'];
  const idx = steps.indexOf(step);
  const currentIdx = steps.indexOf(current);
  const active = idx <= currentIdx;
  const currentActive = idx === currentIdx;

  return (
    <div className={`flex items-center gap-3 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-30'}`}>
      <div className={`w-3 h-3 rounded-full ${active ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-gray-600'}`}></div>
      <span className={`text-sm ${currentActive ? 'text-white font-bold' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
};