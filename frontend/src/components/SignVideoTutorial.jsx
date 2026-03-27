import { useState, useRef, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  LightBulbIcon,
  BookOpenIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function SignVideoTutorial({ 
  signLabel, 
  isOpen, 
  onClose,
  signDictionary = {}
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSlowMotion, setShowSlowMotion] = useState(false);
  const videoRef = useRef(null);

  const tutorialSteps = [
    {
      title: "Hand Position",
      description: "Start with your hand in a neutral position",
      tip: "Keep your wrist straight and fingers relaxed"
    },
    {
      title: "Form the Sign",
      description: "Slowly form the sign shape",
      tip: "Take your time to get the position right"
    },
    {
      title: "Hold Steady",
      description: "Hold the sign steady for 2-3 seconds",
      tip: "This helps the recognition system detect your sign"
    },
    {
      title: "Release",
      description: "Gently return to neutral position",
      tip: "Practice the transition smoothly"
    }
  ];

  const practiceTips = [
    "Use good lighting on your hand",
    "Keep your hand clearly visible in the camera",
    "Practice slowly before trying at normal speed",
    "Hold each sign for 2-3 seconds",
    "Keep your wrist straight and fingers relaxed",
    "Practice regularly for best results"
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
    if (videoRef.current) {
      // Jump to specific time in video based on step
      const timeMap = [0, 2, 4, 6]; // seconds
      videoRef.current.currentTime = timeMap[step] || 0;
    }
  };

  const handleSlowMotion = () => {
    if (videoRef.current) {
      setShowSlowMotion(!showSlowMotion);
      videoRef.current.playbackRate = showSlowMotion ? 1 : 0.5;
    }
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const signInfo = signDictionary[signLabel] || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-2 rounded-full">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Video Tutorial: {signInfo.name || signLabel}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Learn how to make the {signLabel} sign correctly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Video Section */}
          <div className="flex-1 p-4">
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                poster="/images/sign-tutorial-poster.jpg"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                <source src={`/videos/sign-${signLabel?.toLowerCase()}.mp4`} type="video/mp4" />
                <source src={`/videos/sign-${signLabel?.toLowerCase()}.webm`} type="video/webm" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video Overlay Controls */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handlePlayPause}
                  className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-all"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-8 h-8" />
                  ) : (
                    <PlayIcon className="w-8 h-8" />
                  )}
                </button>
              </div>
            </div>

            {/* Video Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReplay}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Replay</span>
                </button>
                <button
                  onClick={handleSlowMotion}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    showSlowMotion
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>Slow Motion</span>
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {signInfo.name || signLabel} Tutorial
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2 text-blue-500" />
                Step-by-Step Guide
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {tutorialSteps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepChange(index)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      currentStep === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs opacity-90">{step.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 p-4 border-l border-gray-200 dark:border-gray-700 space-y-4">
            {/* Sign Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {signInfo.name || `Letter ${signLabel}`}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                {signInfo.description || 'Learn how to make this sign correctly'}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {signInfo.usage || 'Used in spelling and communication'}
              </p>
            </div>

            {/* Practice Tips */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                <LightBulbIcon className="w-4 h-4 mr-2" />
                Practice Tips
              </h4>
              <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                {practiceTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Step Details */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Current Step: {tutorialSteps[currentStep]?.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {tutorialSteps[currentStep]?.description}
              </p>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-xs text-blue-800 dark:text-blue-200">
                💡 {tutorialSteps[currentStep]?.tip}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Learning Progress
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 dark:text-green-300">Steps Completed</span>
                  <span className="text-green-700 dark:text-green-300">{currentStep + 1}/4</span>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {/* Navigation Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                  disabled={currentStep === 0}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                >
                  Previous
                </button>
                {currentStep === tutorialSteps.length - 1 ? (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
                  >
                    <AcademicCapIcon className="w-4 h-4" />
                    <span>Finish</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(Math.min(currentStep + 1, tutorialSteps.length - 1))}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Next
                  </button>
                )}
              </div>
              
              {/* Exit Button */}
              <button
                onClick={onClose}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <XMarkIcon className="w-5 h-5" />
                <span>Exit Tutorial</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}