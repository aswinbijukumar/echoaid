import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContextConstants';
import { useLearning } from '../context/LearningContext'; // Import Context
import { useUserStats } from '../hooks/useUserStats';
import Sidebar from '../components/Sidebar';
import TopBarUserAvatar from '../components/TopBarUserAvatar';
import LearningModule from '../components/LearningModule';
import LevelTree from '../components/LevelTree';
import {
  FireIcon,
  SparklesIcon,
  StarIcon,
  BoltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function Learn() {
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const { stats: userStats } = useUserStats();
  const { learningPath, loading, error, refresh } = useLearning();
  const navigate = useNavigate();

  // Local UI state
  const [currentUnit, setCurrentUnit] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showLearningModule, setShowLearningModule] = useState(false);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  // Refresh path on visibility/focus
  useEffect(() => {
    const handleRefresh = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener('visibilitychange', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    return () => {
      document.removeEventListener('visibilitychange', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [refresh]);

  // Handle module parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module');
    if (moduleId && learningPath.length > 0) {
      const module = learningPath.find(m => m._id === moduleId);
      if (module) {
        setSelectedSkill(module);
        setShowLearningModule(true);
      }
    }
  }, [learningPath]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCompletion = async (completedSkillData) => {
    // If a quiz was unlocked or it's the last module, let the LearningModule handle the UI/redirection
    if (completedSkillData?.quizUnlocked || completedSkillData?.isLastModuleInLevel) {
      await refresh();
      return;
    }

    setShowLearningModule(false);
    setSelectedSkill(null);
    await refresh();
  };

  if (loading && learningPath.length === 0) {
    return (
      <div className={`min-h-screen ${bg} ${text} flex`}>
        <Sidebar handleLogout={() => {}} />
        <div className="flex-1 ml-64 p-8 pt-24">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-700 rounded-lg w-1/3"></div>
            <div className={`h-32 ${cardBg} rounded-lg border ${border}`}></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-700 rounded-lg w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg text-red-500 mb-4`}>Error: {error}</p>
          <button onClick={refresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
      {/* Top Status Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${statusBarBg} border-b ${border} px-6 py-3 pl-64`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4"></div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">{userStats.streak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{userStats.totalXP} XP</span>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Rank {userStats.level}</span>
            </div>
            <TopBarUserAvatar size={8} />
          </div>
        </div>
      </div>

      <div className="flex">
        <Sidebar handleLogout={handleLogout} />
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-300 dark:bg-gray-600 z-40"></div>

        {/* Main Content */}
        <div className={`flex-1 ml-64 ${bg} overflow-hidden pt-20`}>
          <div className="max-w-7xl mx-auto min-h-0">
            <div className="flex-1 p-6">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-3xl font-bold ${text} mb-2`}>Learning Path</h1>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Master Indian Sign Language step by step
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/practice')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <BoltIcon className="w-4 h-4 inline mr-2" /> Practice
                    </button>
                    <button onClick={() => navigate('/dictionary')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <ClockIcon className="w-4 h-4 inline mr-2" /> Dictionary
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div className={`${cardBg} rounded-lg border ${border} p-6 mb-8`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-1">
                      {learningPath?.filter(u => u.isCompleted).length || 0}
                    </div>
                    <div className="text-sm opacity-70">Units Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-1">
                      {learningPath?.filter(u => u.userScore > 0).length || 0}
                    </div>
                    <div className="text-sm opacity-70">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-1">
                      {learningPath?.filter(u => !u.isUnlocked).length || 0}
                    </div>
                    <div className="text-sm opacity-70">Locked</div>
                  </div>
                </div>
              </div>

              <LevelTree />
            </div>
          </div>
        </div>
      </div>

      {/* Learning Module */}
      {showLearningModule && selectedSkill && (
        <LearningModule
          skill={selectedSkill}
          nextSkill={learningPath[learningPath.findIndex(s => s._id === selectedSkill._id) + 1]}
          onBack={() => {
            setShowLearningModule(false);
            setSelectedSkill(null);
          }}
          onComplete={handleCompletion}
          onNext={async () => {
            await refresh();
            const currentIndex = learningPath.findIndex(s => s._id === selectedSkill._id);
            if (currentIndex >= 0 && currentIndex < learningPath.length - 1) {
              setSelectedSkill(learningPath[currentIndex + 1]);
            } else {
              setShowLearningModule(false);
              setSelectedSkill(null);
            }
          }}
        />
      )}
    </div>
  );
}