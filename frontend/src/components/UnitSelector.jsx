import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { API_BASE_URL } from '../constants/api';
import {
  AcademicCapIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ClockIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';

export default function UnitSelector({ onUnitSelect, onBack }) {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first, fallback to mock data
      try {
        const response = await fetch(`${API_BASE_URL}/api/curriculum/units`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUnits(data.data);
            return;
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
      }
      
      // Fallback to mock data
      const mockUnits = [
        {
          _id: '1',
          title: "Basic Greetings",
          description: "Learn essential greetings and farewells",
          icon: "HandRaisedIcon",
          color: "bg-green-500",
          level: "Beginner",
          lessons: [
            { id: 1, title: "Hello", completed: false },
            { id: 2, title: "Goodbye", completed: false },
            { id: 3, title: "Thank you", completed: false }
          ],
          estimatedDuration: 15,
          progress: 0,
          isCompleted: false,
          isUnlocked: true,
          xpReward: 50
        },
        {
          _id: '2',
          title: "Alphabet Basics",
          description: "Master the sign language alphabet",
          icon: "AcademicCapIcon",
          color: "bg-blue-500",
          level: "Beginner",
          lessons: [
            { id: 1, title: "Letters A-M", completed: false },
            { id: 2, title: "Letters N-Z", completed: false }
          ],
          estimatedDuration: 20,
          progress: 0,
          isCompleted: false,
          isUnlocked: true,
          xpReward: 75
        },
        {
          _id: '3',
          title: "Family & Friends",
          description: "Signs for relationships and people",
          icon: "UserCircleIcon",
          color: "bg-pink-500",
          level: "Intermediate",
          lessons: [
            { id: 1, title: "Family members", completed: false },
            { id: 2, title: "Friends", completed: false }
          ],
          estimatedDuration: 25,
          progress: 0,
          isCompleted: false,
          isUnlocked: false,
          xpReward: 100
        }
      ];
      
      setUnits(mockUnits);
      
    } catch (err) {
      console.error('Error fetching units:', err);
      setError('Failed to load curriculum. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      AcademicCapIcon,
      BookOpenIcon,
      PuzzlePieceIcon,
      UserCircleIcon,
      ChatBubbleLeftRightIcon,
      FireIcon,
      SparklesIcon,
      StarIcon,
      HandRaisedIcon
    };
    return icons[iconName] || AcademicCapIcon;
  };

  const getStatusColor = (unit) => {
    if (unit.isCompleted) return 'bg-green-500';
    if (unit.isUnlocked) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getStatusText = (unit) => {
    if (unit.isCompleted) return 'Completed';
    if (unit.isUnlocked) return 'Available';
    return 'Locked';
  };

  if (loading) {
    return (
      <div className={`${bg} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${text}`}>Loading curriculum...</p>
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
            onClick={fetchUnits}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bg} min-h-screen p-6`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${text} mb-2`}>Learning Path</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Master sign language step by step
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => {
          const IconComponent = getIcon(unit.icon);
          const isClickable = unit.isUnlocked || unit.isCompleted;
          
          return (
            <div
              key={unit._id}
              className={`${cardBg} rounded-lg border ${border} p-6 transition-all duration-200 ${
                isClickable 
                  ? 'hover:transform hover:scale-[1.02] cursor-pointer hover:shadow-lg' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => isClickable && onUnitSelect(unit)}
            >
              {/* Unit Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${unit.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  {unit.isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : !unit.isUnlocked ? (
                    <LockClosedIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ArrowRightIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>

              {/* Unit Info */}
              <div className="mb-4">
                <h3 className={`text-xl font-bold ${text} mb-2`}>{unit.title}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  {unit.description}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    unit.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    unit.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {unit.level}
                  </span>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {unit.lessons.length} lessons
                  </span>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {unit.estimatedDuration} min
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${text}`}>Progress</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {unit.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${getStatusColor(unit)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${unit.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  unit.isCompleted ? 'text-green-600' :
                  unit.isUnlocked ? 'text-blue-600' :
                  'text-gray-400'
                }`}>
                  {getStatusText(unit)}
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {unit.xpReward} XP
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {units.length === 0 && (
        <div className="text-center py-12">
          <HandRaisedIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold mb-2 ${text}`}>No Units Available</h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Curriculum units will appear here once they are created.
          </p>
        </div>
      )}
    </div>
  );
}