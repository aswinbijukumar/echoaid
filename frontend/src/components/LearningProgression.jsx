import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function LearningProgression({ 
  sign, 
  userProgress = {}, 
  onProgressUpdate 
}) {
  const { darkMode } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [practiceCount, setPracticeCount] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const levels = [
    {
      id: 1,
      name: 'Basic Recognition',
      description: 'Learn the basic hand shape and position',
      requirements: { practiceCount: 0, accuracy: 0 },
      tips: [
        'Focus on getting the basic hand shape correct',
        'Pay attention to finger positioning',
        'Practice in front of a mirror'
      ]
    },
    {
      id: 2,
      name: 'Position & Orientation',
      description: 'Master the correct position and orientation',
      requirements: { practiceCount: 3, accuracy: 60 },
      tips: [
        'Ensure your hand is in the right position relative to your body',
        'Check the orientation of your palm',
        'Practice with different angles'
      ]
    },
    {
      id: 3,
      name: 'Movement & Flow',
      description: 'Perfect the movement pattern and flow',
      requirements: { practiceCount: 8, accuracy: 75 },
      tips: [
        'Focus on smooth, natural movements',
        'Practice the complete sign sequence',
        'Work on timing and rhythm'
      ]
    },
    {
      id: 4,
      name: 'Mastery',
      description: 'Achieve consistent, accurate signing',
      requirements: { practiceCount: 15, accuracy: 90 },
      tips: [
        'Practice until the sign becomes natural',
        'Focus on consistency across multiple attempts',
        'Work on speed while maintaining accuracy'
      ]
    }
  ];

  useEffect(() => {
    // Update progress from props
    if (userProgress.practiceCount !== undefined) {
      setPracticeCount(userProgress.practiceCount);
    }
    if (userProgress.accuracy !== undefined) {
      setAccuracy(userProgress.accuracy);
    }
    
    // Determine current level and unlocked levels
    const newUnlockedLevels = [];
    let newCurrentLevel = 1;
    
    levels.forEach(level => {
      if (practiceCount >= level.requirements.practiceCount && 
          accuracy >= level.requirements.accuracy) {
        newUnlockedLevels.push(level.id);
        newCurrentLevel = level.id;
      }
    });
    
    setUnlockedLevels(newUnlockedLevels);
    setCurrentLevel(newCurrentLevel);
  }, [userProgress, practiceCount, accuracy]);

  const getLevelProgress = (level) => {
    const practiceProgress = Math.min((practiceCount / level.requirements.practiceCount) * 100, 100);
    const accuracyProgress = Math.min((accuracy / level.requirements.accuracy) * 100, 100);
    return Math.min(practiceProgress, accuracyProgress);
  };

  const getNextLevel = () => {
    return levels.find(level => level.id === currentLevel + 1);
  };

  const getCurrentLevelData = () => {
    return levels.find(level => level.id === currentLevel);
  };

  const nextLevel = getNextLevel();
  const currentLevelData = getCurrentLevelData();

  return (
    <div className={`${darkMode ? 'bg-[#23272F]' : 'bg-gray-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} p-6`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Learning Progression</h3>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Master "{sign.word}" step by step
        </p>
      </div>

      {/* Current Level */}
      <div className="mb-6">
        <div className={`p-4 rounded-lg ${
          currentLevel === 4 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Current Level: {currentLevelData.name}</span>
            <span className="text-sm">
              {practiceCount} practices • {Math.round(accuracy)}% accuracy
            </span>
          </div>
          <p className="text-sm">{currentLevelData.description}</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Practice Count</span>
            <span className="text-sm">{practiceCount}/{currentLevelData.requirements.practiceCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((practiceCount / currentLevelData.requirements.practiceCount) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Accuracy</span>
            <span className="text-sm">{Math.round(accuracy)}%/{currentLevelData.requirements.accuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((accuracy / currentLevelData.requirements.accuracy) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Level Tips */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">💡 Tips for {currentLevelData.name}:</h4>
        <ul className="space-y-2">
          {currentLevelData.tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span className="text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Level Preview */}
      {nextLevel && (
        <div className="border-t border-gray-300 pt-4">
          <h4 className="font-semibold mb-3">🎯 Next Level: {nextLevel.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{nextLevel.description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Practice Count:</span>
              <span className={`text-sm ${
                practiceCount >= nextLevel.requirements.practiceCount ? 'text-green-600' : 'text-gray-600'
              }`}>
                {practiceCount}/{nextLevel.requirements.practiceCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Accuracy:</span>
              <span className={`text-sm ${
                accuracy >= nextLevel.requirements.accuracy ? 'text-green-600' : 'text-gray-600'
              }`}>
                {Math.round(accuracy)}%/{nextLevel.requirements.accuracy}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* All Levels Overview */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">📚 All Levels</h4>
        <div className="space-y-2">
          {levels.map(level => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const isCurrent = level.id === currentLevel;
            const progress = getLevelProgress(level);
            
            return (
              <div 
                key={level.id} 
                className={`p-3 rounded-lg border ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50' 
                    : isUnlocked 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${
                    isCurrent ? 'text-blue-800' : isUnlocked ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    Level {level.id}: {level.name}
                  </span>
                  <span className={`text-sm ${
                    isCurrent ? 'text-blue-600' : isUnlocked ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isUnlocked ? '✅' : '🔒'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isCurrent ? 'bg-blue-500' : isUnlocked ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}