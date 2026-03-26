import { useState, useEffect } from 'react';
import { XMarkIcon, FireIcon, TrophyIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

export default function StreakNotification({ 
  isVisible, 
  onClose, 
  streakData, 
  type = 'milestone' // 'milestone', 'daily', 'break'
}) {
  const { darkMode } = useTheme();
  const [animationClass, setAnimationClass] = useState('');

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';

  useEffect(() => {
    if (isVisible) {
      setAnimationClass('animate-slide-in-right');
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setAnimationClass('animate-slide-out-right');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getNotificationContent = () => {
    switch (type) {
      case 'milestone':
        return {
          icon: <TrophyIcon className="w-8 h-8 text-yellow-500" />,
          title: `🎉 ${streakData?.title || 'Milestone Achieved!'}`,
          message: streakData?.message || 'Congratulations on your achievement!',
          bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          textColor: 'text-white'
        };
      case 'daily':
        return {
          icon: <FireIcon className="w-8 h-8 text-orange-500" />,
          title: `🔥 Day ${streakData?.streak || 0} Streak!`,
          message: streakData?.message || 'Keep up the great work!',
          bgColor: 'bg-gradient-to-r from-orange-400 to-red-500',
          textColor: 'text-white'
        };
      case 'break':
        return {
          icon: <SparklesIcon className="w-8 h-8 text-blue-500" />,
          title: '💪 Streak Restored!',
          message: 'Welcome back! Your dedication is inspiring.',
          bgColor: 'bg-gradient-to-r from-blue-400 to-purple-500',
          textColor: 'text-white'
        };
      default:
        return {
          icon: <FireIcon className="w-8 h-8 text-orange-500" />,
          title: '🔥 Streak Update',
          message: 'Keep learning every day!',
          bgColor: 'bg-gradient-to-r from-orange-400 to-red-500',
          textColor: 'text-white'
        };
    }
  };

  if (!isVisible) return null;

  const content = getNotificationContent();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${content.bgColor} ${content.textColor} rounded-xl shadow-2xl border-2 border-white/20 p-4 ${animationClass}`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Notification Content */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {content.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg mb-1">
              {content.title}
            </h4>
            <p className="text-sm opacity-90 mb-3">
              {content.message}
            </p>
            
            {/* Progress Bar for Milestones */}
            {type === 'milestone' && streakData?.progress && (
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${streakData.progress}%` }}
                ></div>
              </div>
            )}
            
            {/* Action Button */}
            <button
              onClick={handleClose}
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
            >
              Awesome! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS Animation Classes (add to your global CSS)
const streakNotificationStyles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-slide-out-right {
  animation: slide-out-right 0.3s ease-in;
}
`;

// Export styles for global inclusion
export { streakNotificationStyles };
