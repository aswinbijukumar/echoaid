import React, { useState, useEffect } from 'react';

const LevelUpAnimation = ({ isOpen, onClose, newLevel, xpGained, streak }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setTimeout(() => setShowContent(true), 500);
    } else {
      setShowAnimation(false);
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getLevelTitle = (level) => {
    const titles = [
      'Beginner',      // Level 0
      'Intermediate',  // Level 1
      'Advanced',      // Level 2
      'Expert',        // Level 3
      'Master',        // Level 4
      'Grandmaster',   // Level 5
      'Legendary',     // Level 6
      'Mythic',        // Level 7
      'Transcendent',  // Level 8
      'Divine',        // Level 9
      'Ultimate',      // Level 10
      'Supreme',       // Level 11
      'Infinite',      // Level 12
      'Eternal',       // Level 13
      'Cosmic',        // Level 14
      'Universal'      // Level 15+
    ];
    return titles[level] || `Level ${level}`;
  };

  const getLevelColor = (level) => {
    const colors = [
      'from-green-400 to-green-600',    // Level 0
      'from-blue-400 to-blue-600',      // Level 1
      'from-purple-400 to-purple-600',  // Level 2
      'from-orange-400 to-orange-600',  // Level 3
      'from-red-400 to-red-600',        // Level 4
      'from-yellow-400 to-yellow-600',  // Level 5
      'from-pink-400 to-pink-600',      // Level 6
      'from-indigo-400 to-indigo-600',  // Level 7
      'from-teal-400 to-teal-600',      // Level 8
      'from-cyan-400 to-cyan-600',      // Level 9
      'from-emerald-400 to-emerald-600', // Level 10
      'from-violet-400 to-violet-600',  // Level 11
      'from-rose-400 to-rose-600',      // Level 12
      'from-amber-400 to-amber-600',    // Level 13
      'from-lime-400 to-lime-600',      // Level 14
      'from-sky-400 to-sky-600'         // Level 15+
    ];
    return colors[level] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
          showAnimation ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Animation Container */}
      <div className={`relative z-10 transition-all duration-700 transform ${
        showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
      }`}>
        
        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
          
          {/* Level Badge */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${getLevelColor(newLevel)} flex items-center justify-center shadow-lg animate-pulse`}>
            <span className="text-3xl font-bold text-white">{newLevel}</span>
          </div>
          
          {/* Title */}
          <div className={`text-center mb-6 transition-all duration-1000 delay-300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h2 className="text-2xl font-bold text-white mb-2">Level Up!</h2>
            <p className={`text-lg font-semibold bg-gradient-to-r ${getLevelColor(newLevel)} bg-clip-text text-transparent`}>
              {getLevelTitle(newLevel)}
            </p>
          </div>
          
          {/* Stats */}
          <div className={`space-y-4 transition-all duration-1000 delay-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            
            {/* XP Gained */}
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">XP</span>
                </div>
                <span className="text-white font-medium">Experience Gained</span>
              </div>
              <span className="text-green-400 font-bold text-lg">+{xpGained}</span>
            </div>
            
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🔥</span>
                  </div>
                  <span className="text-white font-medium">Learning Streak</span>
                </div>
                <span className="text-orange-400 font-bold text-lg">{streak} days</span>
              </div>
            )}
            
            {/* Level Progress */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">New Level</span>
                <span className="text-blue-400 font-bold">Level {newLevel}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`h-2 bg-gradient-to-r ${getLevelColor(newLevel)} rounded-full transition-all duration-1000 delay-700`} 
                     style={{ width: '100%' }} />
              </div>
            </div>
          </div>
          
          {/* Continue Button */}
          <div className={`mt-8 transition-all duration-1000 delay-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={onClose}
              className={`w-full py-4 bg-gradient-to-r ${getLevelColor(newLevel)} text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              Continue Learning
            </button>
          </div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white/30 rounded-full animate-ping ${
                showContent ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelUpAnimation;
