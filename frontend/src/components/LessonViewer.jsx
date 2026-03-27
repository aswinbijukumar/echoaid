import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { API_BASE_URL } from '../constants/api';
import ExerciseRenderer from './ExerciseRenderer';
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  AcademicCapIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';

export default function LessonViewer({ unit, onBack, onLessonComplete }) {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [lessonProgress, setLessonProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  useEffect(() => {
    if (unit) {
      fetchUnitLessons();
    }
  }, [unit]);

  const fetchUnitLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/curriculum/units/${unit._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unit lessons');
      }

      const data = await response.json();
      setLessons(data.data.lessons);
      
      // Set first unlocked lesson as current
      const firstUnlocked = data.data.lessons.find(lesson => lesson.isUnlocked);
      if (firstUnlocked) {
        setCurrentLesson(firstUnlocked);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = (exerciseScore) => {
    const newProgress = {
      ...lessonProgress,
      [currentExercise]: exerciseScore
    };
    setLessonProgress(newProgress);

    // Move to next exercise
    if (currentExercise < currentLesson.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      // Lesson completed
      completeLesson();
    }
  };

  const completeLesson = async () => {
    try {
      const totalScore = Object.values(lessonProgress).reduce((sum, score) => sum + score, 0);
      const averageScore = totalScore / currentLesson.exercises.length;

      const response = await fetch(`${API_BASE_URL}/curriculum/lessons/${currentLesson._id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          score: averageScore,
          timeSpent: 0, // TODO: Calculate actual time
          exercises: Object.keys(lessonProgress).map(index => ({
            index: parseInt(index),
            score: lessonProgress[index]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete lesson');
      }

      const data = await response.json();
      
      // Update lessons list
      setLessons(prev => prev.map(lesson => 
        lesson._id === currentLesson._id 
          ? { ...lesson, isCompleted: true, progress: 100, score: averageScore }
          : lesson
      ));

      // Move to next lesson
      const nextLesson = lessons.find(lesson => 
        lesson.order === currentLesson.order + 1 && lesson.isUnlocked
      );
      
      if (nextLesson) {
        setCurrentLesson(nextLesson);
        setCurrentExercise(0);
        setLessonProgress({});
      } else {
        // Unit completed
        onLessonComplete(data.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className={`${bg} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${text}`}>Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${bg} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg text-red-500 mb-4`}>Error: {error}</p>
          <button
            onClick={() => fetchUnitLessons()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className={`${bg} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <HandRaisedIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${text}`}>No lessons available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bg} min-h-screen`}>
      {/* Header */}
      <div className={`border-b ${border} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${text}`}>{unit.title}</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentLesson.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentLesson.duration} min
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentLesson.xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Lesson Info */}
          <div className={`${cardBg} rounded-lg border ${border} p-6 mb-6`}>
            <div className="flex items-center space-x-3 mb-4">
              <AcademicCapIcon className="w-8 h-8 text-blue-500" />
              <h2 className={`text-xl font-bold ${text}`}>Lesson Objectives</h2>
            </div>
            <ul className="space-y-2">
              {currentLesson.objectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {objective}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercise Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${text}`}>
                Exercise {currentExercise + 1} of {currentLesson.exercises.length}
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {Math.round((currentExercise / currentLesson.exercises.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentExercise / currentLesson.exercises.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Exercise */}
          <ExerciseRenderer
            exercise={currentLesson.exercises[currentExercise]}
            onComplete={handleExerciseComplete}
            exerciseNumber={currentExercise + 1}
            totalExercises={currentLesson.exercises.length}
          />
        </div>
      </div>
    </div>
  );
}