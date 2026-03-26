import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import SignRecognition from './SignRecognition';
import {
  XMarkIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowRightIcon,
  EyeIcon,
  HandRaisedIcon,
  AcademicCapIcon,
  PuzzlePieceIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function LessonModal({ skill, onClose, onComplete }) {
  const { darkMode } = useTheme();
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exercises, setExercises] = useState([]);
  // Removed hearts system - using existing gamification
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  useEffect(() => {
    // Generate exercises based on skill
    generateExercises();
  }, [skill]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const generateExercises = () => {
    const exerciseTypes = [
      'sign-recognition', 
      'sign-production', 
      'translation', 
      'matching',
      'multiple-choice',
      'flashcard',
      'spelling',
      'video-tutorial'
    ];
    const generatedExercises = [];

    for (let i = 0; i < 5; i++) {
      const type = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
      generatedExercises.push({
        id: i,
        type,
        question: generateQuestion(type),
        options: generateOptions(type),
        correctAnswer: generateCorrectAnswer(type),
        explanation: generateExplanation(type),
        points: 10,
        targetSign: skill.targetSign || null
      });
    }

    setExercises(generatedExercises);
  };

  const generateQuestion = (type) => {
    switch (type) {
      case 'sign-recognition':
        return 'What sign is this?';
      case 'sign-production':
        return 'Show the sign for:';
      case 'translation':
        return 'What does this sign mean?';
      case 'matching':
        return 'Match the sign with its meaning:';
      case 'multiple-choice':
        return 'Choose the correct answer:';
      case 'flashcard':
        return 'Study this sign:';
      case 'spelling':
        return 'Spell this word in sign language:';
      case 'video-tutorial':
        return 'Watch and learn:';
      default:
        return 'Complete this exercise:';
    }
  };

  const generateOptions = (type) => {
    const baseOptions = ['Hello', 'Goodbye', 'Thank you', 'Please', 'Sorry'];
    return baseOptions.map(option => ({
      text: option,
      isCorrect: option === 'Hello' // Simplified for demo
    }));
  };

  const generateCorrectAnswer = (type) => {
    return 'Hello'; // Simplified for demo
  };

  const generateExplanation = (type) => {
    return 'This is the correct answer because...';
  };

  const handleExerciseComplete = (exerciseScore, isCorrect) => {
    if (isCorrect) {
      setScore(prev => prev + exerciseScore);
    } else {
      setMistakes(prev => prev + 1);
    }

    // Move to next exercise
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setTimeLeft(30);
    } else {
      // Lesson completed
      completeLesson();
    }
  };

  const completeLesson = () => {
    const totalScore = score + (exercises.length - mistakes) * 10;
    const xpEarned = Math.round(totalScore * 0.1);
    const perfect = mistakes === 0;

    setLessonComplete(true);
    setShowResult(true);

    // Call onComplete after a delay
    setTimeout(() => {
      onComplete({
        xpEarned,
        mistakes,
        perfect,
        score: totalScore,
        heartsUsed: 0
      });
    }, 3000);
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
      case 'multiple-choice':
        return <AcademicCapIcon className="w-6 h-6" />;
      case 'flashcard':
        return <BookOpenIcon className="w-6 h-6" />;
      case 'spelling':
        return <AcademicCapIcon className="w-6 h-6" />;
      case 'video-tutorial':
        return <PlayIcon className="w-6 h-6" />;
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
      default:
        return 'Exercise';
    }
  };

  const renderExerciseContent = () => {
    if (!exercises[currentExercise]) return null;

    const exercise = exercises[currentExercise];
    const IconComponent = getExerciseIcon(exercise.type);

    switch (exercise.type) {
      case 'sign-recognition':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className={`text-lg font-semibold ${text} mb-4`}>
                {exercise.question}
              </h4>
              {exercise.targetSign && (
                <div className="mb-6">
                  <video
                    src={exercise.targetSign.videoPath}
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
              onRecognition={(result) => {
                const isCorrect = result.isValid && result.confidence > 0.7;
                handleExerciseComplete(exercise.points, isCorrect);
              }}
              mode="webcam"
            />
          </div>
        );

      case 'sign-production':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className={`text-lg font-semibold ${text} mb-4`}>
                {exercise.question} "{exercise.correctAnswer}"
              </h4>
            </div>
            
            <SignRecognition
              targetSign={{ word: exercise.correctAnswer }}
              onRecognition={(result) => {
                const isCorrect = result.isValid && result.confidence > 0.7;
                handleExerciseComplete(exercise.points, isCorrect);
              }}
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
            
            <div className="space-y-3">
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                    option.isCorrect
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : `${border} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${text}`
                  }`}
                  onClick={() => handleExerciseComplete(exercise.points, option.isCorrect)}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.text}</span>
                    {option.isCorrect && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
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
                      option.isCorrect
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : `${border} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${text}`
                    }`}
                    onClick={() => handleExerciseComplete(exercise.points, option.isCorrect)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${text} mb-4`}>
              {exercise.question}
            </h4>
            
            <div className="text-center mb-6">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                <span className="text-gray-500">Sign Video</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {exercise.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                    option.isCorrect
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : `${border} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${text}`
                  }`}
                  onClick={() => handleExerciseComplete(exercise.points, option.isCorrect)}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.text}</span>
                    {option.isCorrect && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'flashcard':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${text} mb-4`}>
              {exercise.question}
            </h4>
            
            <div className="text-center">
              <div className="w-64 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-6 flex items-center justify-center">
                <span className="text-gray-500">Sign Demonstration</span>
              </div>
              
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${text}`}>{exercise.correctAnswer}</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {exercise.explanation}
                </p>
                
                <button
                  onClick={() => handleExerciseComplete(exercise.points, true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  I understand this sign
                </button>
              </div>
            </div>
          </div>
        );

      case 'spelling':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${text} mb-4`}>
              {exercise.question} "{exercise.correctAnswer}"
            </h4>
            
            <div className="text-center mb-6">
              <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                {exercise.correctAnswer.split('').map((letter, index) => (
                  <div key={index} className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold">{letter.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Practice spelling this word using the sign language alphabet
              </p>
              
              <button
                onClick={() => handleExerciseComplete(exercise.points, true)}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                I can spell this word
              </button>
            </div>
          </div>
        );

      case 'video-tutorial':
        return (
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${text} mb-4`}>
              {exercise.question}
            </h4>
            
            <div className="text-center">
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                    <PlayIcon className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black bg-opacity-50 rounded p-2">
                      <div className="text-white text-sm font-medium">{exercise.correctAnswer}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className={`text-xl font-bold ${text}`}>{exercise.correctAnswer}</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {exercise.explanation}
                </p>
                
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => handleExerciseComplete(exercise.points, true)}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    I learned this sign
                  </button>
                  <button
                    onClick={() => handleExerciseComplete(exercise.points, false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Need more practice
                  </button>
                </div>
              </div>
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

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${bg} rounded-lg p-8 max-w-md w-full mx-4`}>
          <div className="text-center">
            <TrophyIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold ${text} mb-2`}>Lesson Complete!</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Great job! You've completed the {skill.title} lesson.
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className={`${text}`}>Score:</span>
                <span className="font-semibold">{score}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${text}`}>Mistakes:</span>
                <span className="font-semibold">{mistakes}</span>
              </div>
              <div className="flex justify-between">
                <span className={`${text}`}>XP Earned:</span>
                <span className="font-semibold text-blue-500">{Math.round(score * 0.1)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${bg} rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getSkillColor(skill)}`}>
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${text}`}>{skill.title}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Exercise {currentExercise + 1} of {exercises.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Score */}
            <div className="flex items-center space-x-1">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{score}</span>
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <span className={`font-semibold ${timeLeft < 10 ? 'text-red-500' : text}`}>
                {timeLeft}s
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${text}`}>Progress</span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {Math.round(((currentExercise + 1) / exercises.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Exercise Content */}
        <div className={`${cardBg} rounded-lg border ${border} p-6`}>
          {renderExerciseContent()}
        </div>

        {/* Lesson Complete */}
        {lessonComplete && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-green-500" />
              <span className="text-green-800 font-semibold">Lesson Complete!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Great job! You scored {score} points.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get skill color
const getSkillColor = (skill) => {
  const colors = {
    'basics': 'bg-green-500',
    'alphabet': 'bg-blue-500',
    'phrases': 'bg-purple-500',
    'family': 'bg-pink-500',
    'activities': 'bg-orange-500',
    'advanced': 'bg-red-500'
  };
  return colors[skill.category] || 'bg-gray-500';
};
