import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import SignRecognition from './SignRecognition';
import {
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  EyeIcon,
  HandRaisedIcon,
  AcademicCapIcon,
  PuzzlePieceIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function ExerciseRenderer({ exercise, onComplete, exerciseNumber, totalExercises }) {
  const { darkMode } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === exercise.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Calculate score based on time and correctness
    const timeBonus = Math.max(0, timeLeft / 30);
    const score = correct ? Math.round(80 + (timeBonus * 20)) : 0;
    
    setTimeout(() => {
      onComplete(score);
    }, 2000);
  };

  const handleSignRecognition = (result) => {
    setRecognitionResult(result);
    
    // For sign recognition exercises, check if the recognized sign matches the target
    if (exercise.type === 'sign-recognition' && exercise.targetSign) {
      const isCorrectSign = result.label && result.label.toLowerCase() === exercise.targetSign.word.toLowerCase();
      setIsCorrect(isCorrectSign);
      setShowResult(true);
      
      // Calculate score based on confidence and correctness
      const confidenceScore = result.confidence || 0;
      const score = isCorrectSign ? Math.round(confidenceScore) : Math.round(confidenceScore * 0.3);
      
      setTimeout(() => {
        onComplete(score);
      }, 2000);
    }
  };

  const getExerciseIcon = (type) => {
    switch (type) {
      case 'sign-recognition':
        return <EyeIcon className="w-6 h-6" />;
      case 'sign-production':
        return <HandRaisedIcon className="w-6 h-6" />;
      case 'translation':
        return <ArrowRightIcon className="w-6 h-6" />;
      case 'matching':
        return <PuzzlePieceIcon className="w-6 h-6" />;
      case 'fill-blank':
        return <DocumentTextIcon className="w-6 h-6" />;
      default:
        return <PlayIcon className="w-6 h-6" />;
    }
  };

  const getExerciseTitle = (type) => {
    switch (type) {
      case 'sign-recognition':
        return 'Sign Recognition';
      case 'sign-production':
        return 'Sign Production';
      case 'translation':
        return 'Translation';
      case 'matching':
        return 'Matching';
      case 'fill-blank':
        return 'Fill in the Blank';
      default:
        return 'Exercise';
    }
  };

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'sign-recognition':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className={`text-lg font-semibold ${text} mb-4`}>
                Recognize this sign: "{exercise.targetSign?.word}"
              </h4>
              {exercise.mediaUrl && (
                <div className="mb-6">
                  <video
                    src={exercise.mediaUrl}
                    controls
                    className="w-full max-w-md mx-auto rounded-lg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}
            </div>
            
            <SignRecognition
              targetSign={exercise.targetSign}
              onRecognition={handleSignRecognition}
              mode="webcam"
            />
            
            {recognitionResult && (
              <div className={`p-4 rounded-lg ${
                recognitionResult.isValid ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {recognitionResult.isValid ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    recognitionResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {recognitionResult.isValid ? 'Correct!' : 'Try Again'}
                  </span>
                </div>
                <p className={`text-sm ${
                  recognitionResult.isValid ? 'text-green-700' : 'text-red-700'
                }`}>
                  Detected: {recognitionResult.label} ({recognitionResult.confidence}% confidence)
                </p>
              </div>
            )}
          </div>
        );

      case 'sign-production':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className={`text-lg font-semibold ${text} mb-4`}>
                Show the sign for: "{exercise.question}"
              </h4>
            </div>
            
            <SignRecognition
              targetSign={{ word: exercise.question }}
              onRecognition={handleSignRecognition}
              mode="webcam"
            />
          </div>
        );

      case 'translation':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${text} mb-4`}>
              {exercise.question}
            </h4>
            
            {/* Answer Options */}
            <div className="space-y-3">
              {exercise.options.map((option, index) => {
                const isSelected = selectedAnswer === option.text;
                const isCorrectAnswer = option.text === exercise.correctAnswer;
                
                let buttonClass = `w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                  showResult
                    ? isCorrectAnswer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : isSelected
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                    : isSelected
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : `${border} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${text}`
                }`;

                return (
                  <button
                    key={index}
                    className={buttonClass}
                    onClick={() => handleAnswerSelect(option.text)}
                    disabled={showResult}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.text}</span>
                      {showResult && isCorrectAnswer && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${text} mb-4`}>
              {exercise.question}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className={`font-medium ${text}`}>Signs</h5>
                {exercise.options.slice(0, 3).map((option, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${border} ${cardBg}`}>
                    {option.text}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h5 className={`font-medium ${text}`}>Meanings</h5>
                {exercise.options.slice(3).map((option, index) => (
                  <button
                    key={index}
                    className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                      selectedAnswer === option.text
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : `${border} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${text}`
                    }`}
                    onClick={() => handleAnswerSelect(option.text)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'fill-blank':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${text} mb-4`}>
              {exercise.question}
            </h4>
            
            <div className="space-y-3">
              {exercise.options.map((option, index) => {
                const isSelected = selectedAnswer === option.text;
                const isCorrectAnswer = option.text === exercise.correctAnswer;
                
                let buttonClass = `w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                  showResult
                    ? isCorrectAnswer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : isSelected
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                    : isSelected
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : `${border} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${text}`
                }`;

                return (
                  <button
                    key={index}
                    className={buttonClass}
                    onClick={() => handleAnswerSelect(option.text)}
                    disabled={showResult}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.text}</span>
                      {showResult && isCorrectAnswer && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <p className={`text-lg ${text}`}>Exercise type not supported</p>
          </div>
        );
    }
  };

  return (
    <div className={`${cardBg} rounded-lg border ${border} p-6`}>
      {/* Exercise Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg text-white">
            {getExerciseIcon(exercise.type)}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${text}`}>
              {getExerciseTitle(exercise.type)}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Exercise {exerciseNumber} of {totalExercises}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            timeLeft > 10 ? 'bg-green-100 text-green-800' :
            timeLeft > 5 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Exercise Content */}
      {renderExerciseContent()}

      {/* Result Feedback */}
      {showResult && exercise.type !== 'sign-recognition' && exercise.type !== 'sign-production' && (
        <div className={`mt-6 p-4 rounded-lg ${
          isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {isCorrect ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-semibold ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          {exercise.explanation && (
            <p className={`text-sm ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {exercise.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
