import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function PracticeCard({ 
  question, 
  onAnswer, 
  onNext, 
  onPrevious, 
  currentIndex, 
  totalQuestions, 
  userAnswer,
  isLastQuestion = false 
}) {
  const { darkMode } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      const correct = selectedAnswer === question.correctAnswer;
      setIsCorrect(correct);
      setShowFeedback(true);
      
      // Show feedback for a moment before proceeding
      setTimeout(() => {
        setShowFeedback(false);
        onNext();
      }, 1500);
    }
  };

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-xl transform transition-all duration-300 hover:scale-105`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Content */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
        
        {/* Sign Display Area */}
        <div className="mb-6">
          <div className="text-8xl mb-4 animate-bounce">🤟</div>
          <div className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Show the sign for:
          </div>
          <div className="text-3xl font-bold text-green-500 mt-2 animate-pulse">
            {question.sign.word}
          </div>
        </div>

        {/* Category Badge */}
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
          {question.sign.category}
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === question.correctAnswer;
          let buttonClass = `p-4 rounded-xl border-2 transition-all duration-200 ${
            darkMode ? 'bg-gray-700' : 'bg-white'
          }`;

          if (showFeedback) {
            if (isCorrectAnswer) {
              buttonClass += ' border-green-500 bg-green-100 text-green-800';
            } else if (isSelected && !isCorrectAnswer) {
              buttonClass += ' border-red-500 bg-red-100 text-red-800';
            } else {
              buttonClass += ' border-gray-300 opacity-50';
            }
          } else if (isSelected) {
            buttonClass += ' border-green-500 bg-green-50 text-green-700';
          } else {
            buttonClass += ' border-gray-200 hover:border-green-300 hover:bg-green-50';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showFeedback}
              className={buttonClass}
            >
              <div className="text-center">
                <div className="text-xl font-semibold">{option}</div>
                {showFeedback && isCorrectAnswer && (
                  <div className="text-sm mt-1">✓ Correct!</div>
                )}
                {showFeedback && isSelected && !isCorrectAnswer && (
                  <div className="text-sm mt-1">✗ Wrong</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {showFeedback && (
        <div className={`text-center mb-6 p-4 rounded-xl animate-fadeIn ${
          isCorrect 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className="text-lg font-semibold animate-bounce">
            {isCorrect ? '🎉 Great job!' : '😔 Keep practicing!'}
          </div>
          <div className="text-sm mt-1">
            {isCorrect 
              ? 'You got it right!' 
              : `The correct answer is "${question.correctAnswer}"`
            }
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!selectedAnswer || showFeedback}
          className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLastQuestion ? 'Finish Practice' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}