import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
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
  PlayIcon,
  ArrowRightIcon,
  HandRaisedIcon,
  ClockIcon,
  GiftIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function SkillTree({ skills, onSkillClick, userLevel }) {
  const { darkMode } = useTheme();
  const [selectedRow, setSelectedRow] = useState(0);

  // Theme variables
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';

  // Organize skills into rows (like Duolingo's skill tree)
  const skillRows = [
    {
      title: "Basics",
      skills: skills.filter(skill => skill.category === 'basics'),
      color: 'bg-green-500',
      icon: HandRaisedIcon
    },
    {
      title: "Alphabet & Numbers",
      skills: skills.filter(skill => skill.category === 'alphabet'),
      color: 'bg-blue-500',
      icon: AcademicCapIcon
    },
    {
      title: "Common Phrases",
      skills: skills.filter(skill => skill.category === 'phrases'),
      color: 'bg-purple-500',
      icon: ChatBubbleLeftRightIcon
    },
    {
      title: "Family & Friends",
      skills: skills.filter(skill => skill.category === 'family'),
      color: 'bg-pink-500',
      icon: UserCircleIcon
    },
    {
      title: "Daily Activities",
      skills: skills.filter(skill => skill.category === 'activities'),
      color: 'bg-orange-500',
      icon: BookOpenIcon
    },
    {
      title: "Advanced Conversations",
      skills: skills.filter(skill => skill.category === 'advanced'),
      color: 'bg-red-500',
      icon: PuzzlePieceIcon
    }
  ];

  const getSkillIcon = (skill) => {
    const icons = {
      'basics': HandRaisedIcon,
      'alphabet': AcademicCapIcon,
      'phrases': ChatBubbleLeftRightIcon,
      'family': UserCircleIcon,
      'activities': BookOpenIcon,
      'advanced': PuzzlePieceIcon
    };
    return icons[skill.category] || AcademicCapIcon;
  };

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

  const getSkillStatus = (skill) => {
    if (skill.isCompleted) return 'completed';
    if (skill.level > 0) return 'in-progress';
    if (skill.isUnlocked) return 'available';
    return 'locked';
  };

  const getSkillStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'available': return 'bg-green-500';
      case 'locked': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getSkillStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'available': return 'Available';
      case 'locked': return 'Locked';
      default: return 'Unknown';
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 0: return 'bg-purple-500';
      case 1: return 'bg-blue-500';
      case 2: return 'bg-green-500';
      case 3: return 'bg-red-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Skill Tree Header */}
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold ${text} mb-2`}>Your Learning Path</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Complete skills to unlock new ones and master sign language
        </p>
      </div>

      {/* Skill Rows */}
      {skillRows.map((row, rowIndex) => {
        if (row.skills.length === 0) return null;

        return (
          <div key={rowIndex} className="space-y-4">
            {/* Row Header */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${row.color}`}>
                <row.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-xl font-bold ${text}`}>{row.title}</h3>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {row.skills.map((skill) => {
                const IconComponent = getSkillIcon(skill);
                const status = getSkillStatus(skill);
                const isClickable = status !== 'locked';
                
                return (
                  <div
                    key={skill._id}
                    className={`${cardBg} rounded-lg border ${border} p-4 transition-all duration-200 ${
                      isClickable 
                        ? 'hover:transform hover:scale-[1.02] cursor-pointer hover:shadow-lg' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => isClickable && onSkillClick(skill)}
                  >
                    {/* Skill Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${getSkillColor(skill)}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        {status === 'completed' && (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        )}
                        {status === 'locked' && (
                          <LockClosedIcon className="w-4 h-4 text-gray-400" />
                        )}
                        {status === 'available' && (
                          <PlayIcon className="w-4 h-4 text-blue-500" />
                        )}
                        {status === 'in-progress' && (
                          <ClockIcon className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>

                    {/* Skill Info */}
                    <div className="mb-3">
                      <h4 className={`font-semibold ${text} mb-1`}>{skill.title}</h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {skill.description}
                      </p>
                    </div>

                    {/* Skill Level */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${text}`}>Level</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {skill.level}/5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`${getSkillLevelColor(skill.level)} h-1.5 rounded-full transition-all duration-300`}
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Skill Status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        status === 'completed' ? 'text-green-600' :
                        status === 'in-progress' ? 'text-blue-600' :
                        status === 'available' ? 'text-green-600' :
                        'text-gray-400'
                      }`}>
                        {getSkillStatusText(status)}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {skill.xpReward} XP
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`${getSkillStatusColor(status)} h-1 rounded-full transition-all duration-300`}
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {skills.length === 0 && (
        <div className="text-center py-12">
          <HandRaisedIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold mb-2 ${text}`}>No Skills Available</h3>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Skills will appear here once they are created.
          </p>
        </div>
      )}
    </div>
  );
}