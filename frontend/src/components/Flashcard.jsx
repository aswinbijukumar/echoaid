import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../constants/api';
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
  const [showAdditionalImages, setShowAdditionalImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to construct proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL (including Cloudinary), return as is
    if (imagePath.startsWith('http')) return imagePath;
    // If it's a Cloudinary URL, return as is
    if (imagePath.includes('cloudinary.com')) return imagePath;
    // Otherwise, construct the full URL for local files
    return `${API_BASE_URL}${imagePath}`;
  };

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  const playAudio = async () => {
    setIsPlaying(true);
    
    try {
      // Priority 1: Use admin-generated audio if available
      if (card.generatedAudio?.audioText) {
        console.log('Playing admin-generated audio:', card.generatedAudio.audioText);
        await audioGenerator.generateAudio(card.generatedAudio.audioText, {
          rate: 0.6, // Even slower for learning instructions
          pitch: 1.0,
          volume: 1.0
        });
        setIsPlaying(false);
      }
      // Priority 2: If there's a pre-recorded audio file, use it
      else if (card.audioPath) {
        console.log('Playing pre-recorded audio:', card.audioPath);
        const audio = new Audio(card.audioPath);
        audio.play();
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          console.log('Audio file failed, falling back to TTS');
          setIsPlaying(false);
          // Fallback to TTS if audio file fails
          generateTTS();
        };
      } 
      // Priority 3: Generate TTS audio for the word
      else {
        console.log('Generating TTS audio for:', card.word);
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

  const stopAudio = () => {
    // Stop any playing audio
    setIsPlaying(false);
    // Stop TTS if it's playing
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Stop any HTML audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };


  return (
    <div className="w-full max-w-2xl mx-auto bg-transparent">
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Card {currentIndex + 1} of {totalCards}</span>
            <span>{Math.round(((currentIndex + 1) / totalCards) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">

        {/* Card Content */}
        <div className="aspect-[4/3] relative">
          {!isFlipped ? (
            /* Front of Card - Image */
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-full h-full flex items-center justify-center mb-6">
                {card.imagePath ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={getImageUrl(card.imagePath)} 
                      alt={card.word}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        console.log('Image failed to load:', card.imagePath);
                        e.target.style.display = 'none';
                        // Show fallback text
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg';
                        fallback.textContent = 'Image not available';
                        e.target.parentNode.appendChild(fallback);
                      }}
                    />
                    {/* Additional Images Indicator */}
                    {card.additionalImages && card.additionalImages.length > 0 && (
                      <button
                        onClick={() => setShowAdditionalImages(true)}
                        className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        +{card.additionalImages.length} more
                      </button>
                    )}
                  </div>
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
                
                {/* Audio Controls - Always show for admin-generated audio */}
                <div className="mb-4 flex items-center space-x-3">
                  <button
                    onClick={playAudio}
                    disabled={isPlaying}
                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isPlaying ? (
                      <>
                        <PlayIcon className="w-6 h-6 animate-pulse" />
                        <span className="text-sm">Playing...</span>
                      </>
                    ) : (
                      <>
                        <SpeakerWaveIcon className="w-6 h-6" />
                        <span className="text-sm">Listen</span>
                      </>
                    )}
                  </button>
                  
                  {/* Replay Button */}
                  <button
                    onClick={playAudio}
                    disabled={isPlaying}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                    title="Replay audio"
                  >
                    <SpeakerWaveIcon className="w-5 h-5" />
                  </button>
                </div>
                
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
                  onClick={() => {
                    console.log('Got it! button clicked');
                    // Stop any playing audio first
                    stopAudio();
                    // Mark this card as completed
                    if (onComplete) {
                      console.log('Calling onComplete...');
                      onComplete();
                    }
                    // Move to next card if not the last one
                    if (!isLast && onNext) {
                      console.log('Moving to next card...');
                      onNext();
                    }
                  }}
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
      
      {/* Additional Images Modal */}
      {showAdditionalImages && card.additionalImages && card.additionalImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Additional Images</h3>
              <button
                onClick={() => setShowAdditionalImages(false)}
                className="text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <img 
                src={getImageUrl(card.additionalImages[currentImageIndex])} 
                alt={`Additional ${currentImageIndex + 1}`}
                className="w-full h-64 object-contain rounded-lg"
                onError={(e) => {
                  console.log('Additional image failed to load:', card.additionalImages[currentImageIndex]);
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                disabled={currentImageIndex === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-white">
                {currentImageIndex + 1} of {card.additionalImages.length}
              </span>
              
              <button
                onClick={() => setCurrentImageIndex(Math.min(card.additionalImages.length - 1, currentImageIndex + 1))}
                disabled={currentImageIndex === card.additionalImages.length - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
