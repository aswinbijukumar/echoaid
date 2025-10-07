import { useTheme } from '../hooks/useTheme';

export default function PracticeModeCard({ 
  icon, 
  title, 
  description, 
  buttonText, 
  buttonColor = 'green',
  onStart,
  children 
}) {
  const { darkMode } = useTheme();

  const colorClasses = {
    green: 'bg-green-500 hover:bg-green-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };

  const iconBgClasses = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100'
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300`}>
      <div className="text-center mb-6">
        <div className={`w-16 h-16 ${iconBgClasses[buttonColor]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <span className="text-3xl">{icon}</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
      
      {children && (
        <div className="space-y-4 mb-6">
          {children}
        </div>
      )}
      
      <button
        onClick={onStart}
        className={`w-full py-4 ${colorClasses[buttonColor]} text-white rounded-xl font-semibold transition-colors`}
      >
        {buttonText}
      </button>
    </div>
  );
}