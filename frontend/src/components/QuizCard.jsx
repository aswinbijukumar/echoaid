import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import audioGenerator from '../utils/audioGenerator';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  SpeakerWaveIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function QuizCard({ 
  question, 
  onAnswer, 
  onNext, 
  onPrevious, 
  isLast, 
  isFirst,
  showProgress = true,
  currentIndex = 0,
  totalQuestions = 0,
  score = 0
}) {
  const { darkMode } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  const playAudio = async () => {
    setIsPlaying(true);
    
    try {
      // If there's a pre-recorded audio file, use it
      if (question.audioPath) {
        const audio = new Audio(question.audioPath);
        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          // Fallback to TTS if audio file fails
          generateTTS();
        };
      } else {
        // Generate TTS audio for the question text
        await generateTTS();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const generateTTS = async () => {
    try {
      await audioGenerator.generateAudio(question.question, {
        rate: 0.7, // Slower for learning
        pitch: 1.0,
        volume: 1.0
      });
      setIsPlaying(false);
    } catch (error) {
      console.error('TTS generation failed:', error);
      setIsPlaying(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Call the onAnswer callback with the result
    onAnswer(correct);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    onNext();
  };

  const getQuestionTypeIcon = () => {
    switch (question.questionType) {
      case 'image-to-word':
        return '🖼️';
      case 'word-to-image':
        return '📝';
      case 'audio-to-image':
        return '🔊';
      default:
        return '❓';
    }
  };

  const getQuestionTypeText = () => {
    switch (question.questionType) {
      case 'image-to-word':
        return 'What does this sign mean?';
      case 'word-to-image':
        return 'Which sign represents this word?';
      case 'audio-to-image':
        return 'Which sign matches this audio?';
      default:
        return 'Answer the question:';
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${bg}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span className="flex items-center space-x-1">
              <TrophyIcon className="w-4 h-4" />
              <span>Score: {score}</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className={`relative ${cardBg} rounded-2xl shadow-xl border ${border} overflow-hidden`}>
        {/* Question Type Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
            {getQuestionTypeIcon()} {question.questionType.replace('-', ' ')}
          </span>
        </div>

        {/* Question Content */}
        <div className="p-8">
          {/* Question Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {getQuestionTypeText()}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {question.question}
            </p>
          </div>

          {/* Question Media */}
          <div className="mb-6">
            {question.questionType === 'image-to-word' && question.imagePath && (
              <div className="flex justify-center">
                <img 
                  src={question.imagePath} 
                  alt="Sign to identify"
                  className="max-w-full max-h-64 object-contain rounded-lg shadow-lg"
                />
              </div>
            )}
            
            {question.questionType === 'audio-to-image' && question.audioPath && (
              <div className="flex justify-center">
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="p-6 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isPlaying ? (
                    <PlayIcon className="w-12 h-12" />
                  ) : (
                    <SpeakerWaveIcon className="w-12 h-12" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              let optionClass = "w-full p-4 text-left rounded-lg border transition-all duration-200 ";
              
              if (showResult) {
                if (option === question.correctAnswer) {
                  optionClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-200";
                } else if (option === selectedAnswer && !isCorrect) {
                  optionClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-200";
                } else {
                  optionClass += "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400";
                }
              } else {
                optionClass += selectedAnswer === option 
                  ? "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={optionClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && option === question.correctAnswer && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    {showResult && option === selectedAnswer && !isCorrect && (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!showResult && (
            <div className="text-center">
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Result Display */}
          {showResult && (
            <div className="text-center">
              <div className={`p-4 rounded-lg mb-4 ${
                isCorrect 
                  ? 'bg-green-100 border border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-200'
                  : 'bg-red-100 border border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-200'
              }`}>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {isCorrect ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <XCircleIcon className="w-6 h-6" />
                  )}
                  <span className="font-semibold">
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-sm">
                    Correct answer: <strong>{question.correctAnswer}</strong>
                  </p>
                )}
                {question.explanation && (
                  <p className="text-sm mt-2">{question.explanation}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            isFirst 
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-2">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === currentIndex 
                  ? 'bg-blue-500' 
                  : i < currentIndex 
                    ? 'bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {showResult && (
          <button
            onClick={handleNext}
            disabled={isLast}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isLast 
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <span>{isLast ? 'Finish' : 'Next'}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
