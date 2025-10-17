import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import audioGenerator from '../utils/audioGenerator';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  SpeakerWaveIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function Flashcard({ 
  card, 
  isFlipped, 
  onFlip, 
  onNext, 
  onPrevious, 
  isLast, 
  isFirst,
  onComplete,
  showProgress = true,
  currentIndex = 0,
  totalCards = 0
}) {
  const { darkMode } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  const playAudio = async () => {
    setIsPlaying(true);
    
    try {
      // If there's a pre-recorded audio file, use it
      if (card.audioPath) {
        const audio = new Audio(card.audioPath);
        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          // Fallback to TTS if audio file fails
          generateTTS();
        };
      } else {
        // Generate TTS audio for the word
        await generateTTS();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const generateTTS = async () => {
    try {
      await audioGenerator.generateAudio(card.word, {
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${bg}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Card {currentIndex + 1} of {totalCards}</span>
            <span>{Math.round(((currentIndex + 1) / totalCards) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div className={`relative ${cardBg} rounded-2xl shadow-xl border ${border} overflow-hidden`}>
        {/* Difficulty Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(card.difficulty)}`}>
            {card.difficulty}
          </span>
        </div>

        {/* Card Content */}
        <div className="aspect-[4/3] relative">
          {!isFlipped ? (
            /* Front of Card - Image */
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-full h-full flex items-center justify-center mb-6">
                {card.imagePath ? (
                  <img 
                    src={card.imagePath} 
                    alt={card.word}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={onFlip}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <span>Show Answer</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Back of Card - Word + Meaning */
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {card.word}
                </h2>
                
                {card.audioPath && (
                  <button
                    onClick={playAudio}
                    disabled={isPlaying}
                    className="mb-4 p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <PlayIcon className="w-6 h-6" />
                    ) : (
                      <SpeakerWaveIcon className="w-6 h-6" />
                    )}
                  </button>
                )}
                
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {card.meaning}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={onFlip}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Show Image</span>
                </button>
                
                <button
                  onClick={onComplete}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Got it!</span>
                </button>
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
          {Array.from({ length: totalCards }, (_, i) => (
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

        <button
          onClick={onNext}
          disabled={isLast}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            isLast 
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <span>Next</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
