import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import Flashcard from './Flashcard';
import QuizCard from './QuizCard';
import {
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  ArrowLeftIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function LearningModule({ skill, onComplete, onBack }) {
  const { darkMode } = useTheme();
  const { token } = useAuth();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState(new Set());
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  // Determine which mode to show
  const isFlashcardMode = skill.moduleType === 'flashcards' || skill.moduleType === 'mixed';
  const isQuizMode = skill.moduleType === 'quiz' || skill.moduleType === 'mixed';
  
  const flashcards = skill.flashcards || [];
  const quizQuestions = skill.quizQuestions || [];
  
  const totalCards = flashcards.length;
  const totalQuestions = quizQuestions.length;

  const handleCardComplete = (cardIndex) => {
    setCompletedCards(prev => new Set([...prev, cardIndex]));
    
    // Check if all cards are completed
    if (completedCards.size + 1 >= totalCards) {
      if (isQuizMode && totalQuestions > 0) {
        // Move to quiz mode
        setCurrentQuestionIndex(0);
      } else {
        // Complete the module
        handleModuleComplete();
      }
    }
  };

  const handleQuizAnswer = (isCorrect) => {
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleQuizNext = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      // Quiz completed
      handleModuleComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleModuleComplete = async () => {
    setIsCompleted(true);
    setShowResults(true);
    
    // Send completion to backend
    try {
      const response = await fetch(`http://localhost:5000/api/curriculum/skills/${skill._id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: quizScore,
          totalQuestions: totalQuestions,
          completedCards: completedCards.size,
          totalCards: totalCards
        })
      });

      if (response.ok) {
        console.log('Module completed successfully');
      }
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  const getCompletionPercentage = () => {
    if (isFlashcardMode && isQuizMode) {
      const cardProgress = (completedCards.size / totalCards) * 50;
      const quizProgress = (currentQuestionIndex / totalQuestions) * 50;
      return Math.round(cardProgress + quizProgress);
    } else if (isFlashcardMode) {
      return Math.round((completedCards.size / totalCards) * 100);
    } else if (isQuizMode) {
      return Math.round((currentQuestionIndex / totalQuestions) * 100);
    }
    return 0;
  };

  const getCurrentMode = () => {
    if (isFlashcardMode && isQuizMode) {
      return completedCards.size >= totalCards ? 'quiz' : 'flashcards';
    }
    return skill.moduleType;
  };

  if (showResults) {
    return (
      <div className={`min-h-screen ${bg} ${text} p-6`}>
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Learning Path</span>
          </button>

          {/* Results Card */}
          <div className={`${darkMode ? 'bg-[#23272F]' : 'bg-gray-50'} rounded-2xl shadow-xl border ${border} p-8 text-center`}>
            <div className="mb-6">
              <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Module Complete!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                You've completed "{skill.title}"
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {isFlashcardMode && (
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {completedCards.size}/{totalCards}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Cards Learned
                  </div>
                </div>
              )}
              
              {isQuizMode && (
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {quizScore}/{totalQuestions}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Quiz Score
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  +{skill.xpReward}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  XP Earned
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => onComplete && onComplete(skill)}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Continue Learning</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentCardIndex(0);
                  setCurrentQuestionIndex(0);
                  setCompletedCards(new Set());
                  setQuizScore(0);
                  setIsCompleted(false);
                  setShowResults(false);
                }}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Practice Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="mb-4 flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Learning Path</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {skill.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {skill.description}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Progress
              </div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {getCompletionPercentage()}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        {getCurrentMode() === 'flashcards' && flashcards.length > 0 && (
          <Flashcard
            card={flashcards[currentCardIndex]}
            isFlipped={false}
            onFlip={() => {}}
            onNext={() => setCurrentCardIndex(prev => Math.min(prev + 1, totalCards - 1))}
            onPrevious={() => setCurrentCardIndex(prev => Math.max(prev - 1, 0))}
            isLast={currentCardIndex >= totalCards - 1}
            isFirst={currentCardIndex <= 0}
            onComplete={() => handleCardComplete(currentCardIndex)}
            showProgress={true}
            currentIndex={currentCardIndex}
            totalCards={totalCards}
          />
        )}

        {getCurrentMode() === 'quiz' && quizQuestions.length > 0 && (
          <QuizCard
            question={quizQuestions[currentQuestionIndex]}
            onAnswer={handleQuizAnswer}
            onNext={handleQuizNext}
            onPrevious={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
            isLast={currentQuestionIndex >= totalQuestions - 1}
            isFirst={currentQuestionIndex <= 0}
            showProgress={true}
            currentIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            score={quizScore}
          />
        )}

        {(!flashcards.length && !quizQuestions.length) && (
          <div className="text-center py-12">
            <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No content available
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              This learning module doesn't have any flashcards or quiz questions yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
