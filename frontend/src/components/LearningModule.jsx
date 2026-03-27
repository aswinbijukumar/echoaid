import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { API_BASE_URL } from '../constants/api';
import Flashcard from './Flashcard';
import QuizCard from './QuizCard';
import LevelUpAnimation from './LevelUpAnimation';
import {
  AcademicCapIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  ArrowLeftIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function LearningModule({ skill, onComplete, onBack, nextSkill, onNext }) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { token } = useAuth();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState(new Set());
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  // Level-based states (easy -> medium -> hard)
  const [level, setLevel] = useState('easy'); // 'easy' | 'medium' | 'hard'
  const levelOrder = ['easy', 'medium', 'hard'];
  const thresholds = { easy: 70, medium: 85 }; // percent thresholds to advance

  // Level-up animation states
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ newLevel: 0, xpGained: 0, streak: 0 });

  // Flashcard flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // Progression message states
  const [showProgressionMessage, setShowProgressionMessage] = useState(false);
  const [progressionMessage, setProgressionMessage] = useState('');
  const [showQuizButton, setShowQuizButton] = useState(false);
  const [unlockedQuizInfo, setUnlockedQuizInfo] = useState(null); // Store {id, level, isRelearning}

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  // Determine which mode to show
  const isFlashcardMode = skill.moduleType === 'flashcards' || skill.moduleType === 'mixed';
  const isQuizMode = skill.moduleType === 'quiz' || skill.moduleType === 'mixed';

  const flashcardsAll = skill.flashcards || [];
  const quizQuestionsAll = skill.quizQuestions || [];
  // Derive per-level content slices if available; fallback to full arrays
  const flashcards = flashcardsAll;
  const quizQuestions = quizQuestionsAll;

  const totalCards = flashcards.length;
  const totalQuestions = quizQuestions.length;

  const handleCardComplete = (cardIndex) => {
    console.log('Card completed:', cardIndex, 'Total cards:', totalCards);
    const newCompletedCards = new Set([...completedCards, cardIndex]);
    setCompletedCards(newCompletedCards);
    console.log('Completed cards:', newCompletedCards.size, 'out of', totalCards);

    // Check if all cards are completed
    if (newCompletedCards.size >= totalCards) {
      console.log('All cards completed, completing module...');
      if (isQuizMode && totalQuestions > 0) {
        // Move to quiz mode
        console.log('Moving to quiz mode...');
        setCurrentQuestionIndex(0);
      } else {
        // Complete the module
        console.log('Completing module...');
        handleModuleComplete();
      }
    }
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
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

    // Module complete — no popup, results shown inline below

    // Send completion to backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/skills/${skill._id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          score: quizScore,
          mistakes: totalQuestions - quizScore,
          perfect: quizScore === totalQuestions,
          heartsUsed: 0 // No hearts system implemented yet
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Module completed successfully', data);

        // Show level-up animation if user leveled up
        if (data.user && data.user.levelUp) {
          setLevelUpData({
            newLevel: data.user.newLevel || skill.level + 1,
            xpGained: data.xpEarned || skill.xpReward,
            streak: data.user.learningStats?.streak || 0
          });
          setShowLevelUp(true);
        }

        // Check if a quiz was unlocked (specifically for relearning or first time level completion)
        if (data.quizUnlocked) {
          setTimeout(() => {
            setUnlockedQuizInfo({
              id: data.unlockedQuizId,
              level: data.unlockedQuizLevel,
              isRelearning: true
            });
            setProgressionMessage(`🔓 Quiz Re-opened! Level ${data.unlockedQuizLevel} Mastery Quiz is now available with fresh attempts.`);
            setShowProgressionMessage(true);
            setShowQuizButton(true);

            // No auto-redirect — user can click Take Quiz themselves
          }, 800);
        } else if (data.isLastModuleInLevel) {
          setTimeout(() => {
            setProgressionMessage(`🎯 Level ${skill.level} completed! Time for the Level ${skill.level} Mastery Quiz!`);
            setShowProgressionMessage(true);
            setShowQuizButton(true);
          }, 1000);
        }

        // Notify parent about completion with full data
        if (onComplete) {
          onComplete({
            ...skill,
            ...data,
            quizUnlocked: data.quizUnlocked
          });
        }
      }
    } catch (error) {
      console.error('Error completing module:', error);
    }
  };

  // When a quiz finishes at a level, decide whether to advance or complete
  useEffect(() => {
    if (!showResults) return;
    const percent = totalQuestions > 0 ? Math.round((quizScore / totalQuestions) * 100) : 100;
    if (level === 'easy' && percent >= thresholds.easy) {
      // advance to medium
      setLevel('medium');
      // reset session state for next level
      setShowResults(false);
      setIsCompleted(false);
      setCurrentCardIndex(0);
      setCurrentQuestionIndex(0);
      setCompletedCards(new Set());
      setQuizScore(0);
    } else if (level === 'medium' && percent >= thresholds.medium) {
      // advance to hard
      setLevel('hard');
      setShowResults(false);
      setIsCompleted(false);
      setCurrentCardIndex(0);
      setCurrentQuestionIndex(0);
      setCompletedCards(new Set());
      setQuizScore(0);
    }
  }, [showResults]);

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
      <div className="min-h-screen bg-[#1A1A1A] text-white p-6">
        <div className="max-w-2xl mx-auto bg-transparent border border-white/20 backdrop-blur-sm rounded-3xl p-8">
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
              {nextSkill ? (
                <button
                  onClick={() => onNext && onNext(nextSkill)}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Next Lesson: {nextSkill.title}</span>
                </button>
              ) : (
                <button
                  onClick={() => onComplete && onComplete(skill)}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Complete & Return</span>
                </button>
              )}

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
    <div className="min-h-screen bg-[#1A1A1A] text-white p-6">
      <div className="max-w-4xl mx-auto bg-transparent border border-white/20 backdrop-blur-sm rounded-3xl p-8">
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
              <h1 className="text-2xl font-bold text-white">
                {skill.title}
              </h1>
              <p className="text-gray-300">
                {skill.description}
              </p>
              <div className="mt-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 mr-2">
                  {level === 'easy' && 'Level 1: Easy'}
                  {level === 'medium' && 'Level 2: Medium'}
                  {level === 'hard' && 'Level 3: Hard'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">
                Progress
              </div>
              <div className="text-lg font-semibold text-blue-400">
                {getCompletionPercentage()}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          {/* Level hints */}
          <div className="mt-2 text-xs text-gray-400">
            {level === 'easy' && `Reach ${thresholds.easy}% to unlock Medium`}
            {level === 'medium' && `Reach ${thresholds.medium}% to unlock Hard`}
            {level === 'hard' && 'Aim for high precision to master this skill'}
          </div>
        </div>

        {/* Content */}
        {getCurrentMode() === 'flashcards' && flashcards.length > 0 && (
          <Flashcard
            card={flashcards[currentCardIndex]}
            isFlipped={isFlipped}
            onFlip={handleCardFlip}
            onNext={() => {
              if (currentCardIndex < totalCards - 1) {
                setCurrentCardIndex(prev => prev + 1);
                setIsFlipped(false); // Reset flip state for new card
              }
            }}
            onPrevious={() => {
              if (currentCardIndex > 0) {
                setCurrentCardIndex(prev => prev - 1);
                setIsFlipped(false); // Reset flip state for new card
              }
            }}
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

      {/* Progression message removed — no intrusive popup */}

      {/* Quiz Button */}
      {showQuizButton && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {unlockedQuizInfo ? `Quiz Ready!` : `Level ${skill.level} Complete!`}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {unlockedQuizInfo
                ? `Attempts have been reset. You can now take the Level ${unlockedQuizInfo.level} Mastery Quiz again!`
                : `You've completed all modules in Level ${skill.level}. Now take the quiz to unlock Level ${skill.level + 1}!`
              }
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => {
                  setShowQuizButton(false);
                  if (unlockedQuizInfo?.id) {
                    window.location.href = `/quiz/${unlockedQuizInfo.id}`;
                  } else {
                    window.location.href = '/quiz';
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/30"
              >
                Take Quiz Now
              </button>
              <button
                onClick={() => {
                  setShowQuizButton(false);
                  setUnlockedQuizInfo(null);
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Animation */}
      <LevelUpAnimation
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={levelUpData.newLevel}
        xpGained={levelUpData.xpGained}
        streak={levelUpData.streak}
      />
    </div>
  );
}
