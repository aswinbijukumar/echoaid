import { useTheme } from '../hooks/useTheme';

export default function PracticeStats({ 
  streak, 
  xp, 
  totalSigns, 
  completedLessons = 0,
  accuracy = 0 
}) {
  const { darkMode } = useTheme();

  const stats = [
    {
      icon: '🔥',
      value: streak,
      label: 'Day Streak',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    {
      icon: '⭐',
      value: Math.round(xp),
      label: 'Total XP',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      icon: '📚',
      value: totalSigns,
      label: 'Signs Available',
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      icon: '🎯',
      value: completedLessons,
      label: 'Lessons Completed',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      icon: '🎯',
      value: `${Math.round(accuracy)}%`,
      label: 'Accuracy',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="flex items-center">
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mr-4`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}