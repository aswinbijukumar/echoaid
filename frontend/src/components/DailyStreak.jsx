import { useState, useEffect } from 'react';
import { FireIcon, TrophyIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

export default function DailyStreak({ userStats, onStreakMessage }) {
  const { darkMode } = useTheme();
  const [streakMessage, setStreakMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakMilestone, setStreakMilestone] = useState(null);

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  // Streak milestones and messages
  const streakMilestones = [
    { days: 1, message: "🔥 Great start! You're on fire!", emoji: "🔥", color: "text-orange-500" },
    { days: 3, message: "🎯 3 days strong! You're building momentum!", emoji: "🎯", color: "text-blue-500" },
    { days: 7, message: "🌟 Amazing! One week streak achieved!", emoji: "🌟", color: "text-purple-500" },
    { days: 14, message: "💪 Two weeks! You're unstoppable!", emoji: "💪", color: "text-green-500" },
    { days: 30, message: "🏆 Incredible! One month streak!", emoji: "🏆", color: "text-yellow-500" },
    { days: 60, message: "🚀 Outstanding! Two months of dedication!", emoji: "🚀", color: "text-red-500" },
    { days: 100, message: "👑 Legendary! 100 days of excellence!", emoji: "👑", color: "text-indigo-500" },
    { days: 365, message: "🎊 PHENOMENAL! One year streak achieved!", emoji: "🎊", color: "text-pink-500" }
  ];

  // Daily motivation messages
  const dailyMessages = [
    "Keep the streak alive! 🔥",
    "You're doing amazing! 💪",
    "Consistency is key! ⭐",
    "Every day counts! 🌟",
    "You're building something great! 🚀",
    "Stay focused and keep going! 🎯",
    "Your dedication is inspiring! 💎",
    "One day at a time! 🌈"
  ];

  useEffect(() => {
    if (!userStats) return;

    const currentStreak = userStats.streak || 0;
    
    // Check for milestone achievements
    const achievedMilestone = streakMilestones.find(milestone => 
      currentStreak === milestone.days
    );

    if (achievedMilestone) {
      setStreakMilestone(achievedMilestone);
      setStreakMessage(achievedMilestone.message);
      setShowCelebration(true);
      
      // Show celebration for 5 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
    } else {
      // Show daily motivation message
      const randomMessage = dailyMessages[Math.floor(Math.random() * dailyMessages.length)];
      setStreakMessage(randomMessage);
    }

    // Notify parent component
    if (onStreakMessage) {
      onStreakMessage(streakMessage);
    }
  }, [userStats, onStreakMessage]);

  const getStreakColor = (streak) => {
    if (streak >= 100) return 'text-indigo-500';
    if (streak >= 30) return 'text-yellow-500';
    if (streak >= 14) return 'text-green-500';
    if (streak >= 7) return 'text-purple-500';
    if (streak >= 3) return 'text-blue-500';
    return 'text-orange-500';
  };

  const getStreakIcon = (streak) => {
    if (streak >= 100) return '👑';
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '💪';
    if (streak >= 7) return '🌟';
    if (streak >= 3) return '🎯';
    return '🔥';
  };

  const getStreakTitle = (streak) => {
    if (streak >= 365) return 'Legendary Streak';
    if (streak >= 100) return 'Master Streak';
    if (streak >= 30) return 'Expert Streak';
    if (streak >= 14) return 'Advanced Streak';
    if (streak >= 7) return 'Strong Streak';
    if (streak >= 3) return 'Building Streak';
    return 'New Streak';
  };

  if (!userStats) return null;

  const currentStreak = userStats.streak || 0;
  const streakColor = getStreakColor(currentStreak);
  const streakIcon = getStreakIcon(currentStreak);
  const streakTitle = getStreakTitle(currentStreak);

  return (
    <div className={`${cardBg} rounded-xl border ${border} p-6 mb-6 relative overflow-hidden`}>
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse">
          <div className="absolute top-4 right-4 text-4xl animate-bounce">
            {streakMilestone?.emoji}
          </div>
        </div>
      )}

      {/* Streak Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
            <FireIcon className={`w-6 h-6 ${streakColor}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${text}`}>Daily Streak</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {streakTitle}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-3xl font-bold ${streakColor}`}>
            {currentStreak}
          </div>
          <div className="text-sm text-gray-500">days</div>
        </div>
      </div>

      {/* Streak Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Progress to next milestone</span>
          <span className="text-gray-500">
            {currentStreak} / {getNextMilestone(currentStreak)} days
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-1000`}
            style={{ 
              width: `${Math.min(100, (currentStreak / getNextMilestone(currentStreak)) * 100)}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Streak Message */}
      {streakMessage && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'} mb-4`}>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{streakIcon}</span>
            <p className={`font-medium ${text}`}>{streakMessage}</p>
          </div>
        </div>
      )}

      {/* Streak Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'}`}>
          <div className="flex items-center space-x-2">
            <TrophyIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Best Streak</span>
          </div>
          <div className={`text-lg font-bold ${text} mt-1`}>
            {userStats.longestStreak || currentStreak}
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'}`}>
          <div className="flex items-center space-x-2">
            <StarIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Total XP</span>
          </div>
          <div className={`text-lg font-bold ${text} mt-1`}>
            {userStats.totalXP || 0}
          </div>
        </div>
      </div>

      {/* Streak Tips */}
      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start space-x-2">
          <SparklesIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Streak Tip
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {getStreakTip(currentStreak)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getNextMilestone(currentStreak) {
  const milestones = [1, 3, 7, 14, 30, 60, 100, 365];
  return milestones.find(milestone => milestone > currentStreak) || 365;
}

function getStreakTip(streak) {
  if (streak === 0) return "Start your learning journey today! Complete a lesson to begin your streak.";
  if (streak < 3) return "Great start! Try to practice every day to build a strong habit.";
  if (streak < 7) return "You're building momentum! Keep going to reach your first week.";
  if (streak < 14) return "Excellent progress! You're developing a consistent learning routine.";
  if (streak < 30) return "Outstanding dedication! You're on your way to becoming a learning master.";
  if (streak < 100) return "Incredible commitment! You're an inspiration to other learners.";
  return "You're a learning legend! Your consistency is truly remarkable.";
}