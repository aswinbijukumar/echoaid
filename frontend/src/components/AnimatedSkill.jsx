import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  AcademicCapIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
  CheckCircleIcon,
  LockClosedIcon,
  PlayIcon,
  TrophyIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function AnimatedSkill({ skill, onSkillClick, userLevel, isCompleted, isUnlocked, progress }) {
  const { darkMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(skill.level || 0);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  // Get skill icon
  const getSkillIcon = () => {
    const icons = {
      'basics': HandRaisedIcon,
      'alphabet': AcademicCapIcon,
      'numbers': PuzzlePieceIcon,
      'phrases': ChatBubbleLeftRightIcon,
      'family': UserCircleIcon,
      'activities': BookOpenIcon,
      'advanced': PuzzlePieceIcon
    };
    return icons[skill.category] || AcademicCapIcon;
  };

  // Get skill color based on level
  const getSkillColor = (level) => {
    switch (level) {
      case 0: return 'bg-gray-400'; // New
      case 1: return 'bg-purple-500'; // Purple
      case 2: return 'bg-blue-500'; // Blue
      case 3: return 'bg-green-500'; // Green
      case 4: return 'bg-red-500'; // Red
      case 5: return 'bg-orange-500'; // Orange
      default: return 'bg-yellow-500'; // Gold
    }
  };

  // Get skill status
  const getSkillStatus = () => {
    if (isCompleted) return 'completed';
    if (currentLevel > 0) return 'in-progress';
    if (isUnlocked) return 'available';
    return 'locked';
  };

  const status = getSkillStatus();
  const IconComponent = getSkillIcon();
  const skillColor = getSkillColor(currentLevel);

  // Level up animation
  useEffect(() => {
    if (skill.level > currentLevel) {
      setShowLevelUp(true);
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentLevel(skill.level);
        setShowLevelUp(false);
        setIsAnimating(false);
      }, 1000);
    }
  }, [skill.level, currentLevel]);

  // Completion animation
  useEffect(() => {
    if (isCompleted && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }
  }, [isCompleted, isAnimating]);

  const handleClick = () => {
    if (isUnlocked && onSkillClick) {
      setIsAnimating(true);
      setTimeout(() => {
        onSkillClick(skill);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="relative">
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="absolute -top-4 -right-4 z-20 animate-bounce">
          <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <SparklesIcon className="w-4 h-4" />
            <span>LEVEL UP!</span>
          </div>
        </div>
      )}

      {/* Skill Card */}
      <div
        className={`relative ${cardBg} rounded-2xl border ${border} p-4 cursor-pointer transition-all duration-300 ${
          isUnlocked 
            ? 'hover:shadow-xl hover:scale-105 hover:-translate-y-1' 
            : 'opacity-60 cursor-not-allowed'
        } ${
          isAnimating ? 'animate-pulse' : ''
        } ${
          isCompleted ? 'ring-2 ring-yellow-400 shadow-yellow-400/20' : ''
        }`}
        onClick={handleClick}
      >
        {/* Skill Icon */}
        <div className="relative mb-4">
          <div className={`${skillColor} p-4 rounded-xl shadow-lg transition-all duration-300 ${
            isAnimating ? 'scale-110' : ''
          }`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          {/* Completion Badge */}
          {isCompleted && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1 animate-pulse">
              <TrophyIcon className="w-4 h-4" />
            </div>
          )}
          
          {/* Lock Icon */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
              <LockClosedIcon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Skill Info */}
        <div className="text-center">
          <h3 className={`font-bold text-lg mb-1 ${text}`}>
            {skill.title}
          </h3>
          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {skill.description}
          </p>
          
          {/* Progress Bar */}
          {isUnlocked && !isCompleted && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`${skillColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${progress || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress || 0}% Complete
              </p>
            </div>
          )}
          
          {/* XP Reward */}
          <div className="flex items-center justify-center space-x-1 text-sm">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
              {skill.xpReward || 20} XP
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-2 right-2">
          {status === 'completed' && (
            <div className="bg-green-500 text-white rounded-full p-1">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
          )}
          {status === 'in-progress' && (
            <div className="bg-blue-500 text-white rounded-full p-1 animate-pulse">
              <PlayIcon className="w-4 h-4" />
            </div>
          )}
          {status === 'available' && (
            <div className="bg-gray-500 text-white rounded-full p-1">
              <BoltIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Hover Effect */}
        {isUnlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        )}
      </div>

      {/* Connection Line */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
    </div>
  );
}
