import { useState } from 'react';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { darkMode, themeMode, setTheme } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  // Theme variables to match admin profile styling
  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const cardBg = darkMode ? 'bg-[#23272F]' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const textPrimary = darkMode ? 'text-white' : 'text-[#23272F]';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  const themeOptions = [
    { 
      id: 'light', 
      label: 'Light', 
      icon: SunIcon, 
      description: 'Light mode' 
    },
    { 
      id: 'dark', 
      label: 'Dark', 
      icon: MoonIcon, 
      description: 'Dark mode' 
    },
    { 
      id: 'system', 
      label: 'System', 
      icon: ComputerDesktopIcon, 
      description: 'Use system setting' 
    }
  ];

  const currentTheme = themeOptions.find(option => option.id === themeMode) || themeOptions[2];

  return (
    <div className="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200
          ${bg} ${border} ${text} ${hoverBg}
        `}
        title={`Current theme: ${currentTheme.label}`}
      >
        <currentTheme.icon className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-medium">{currentTheme.label}</span>
      </button>

      {/* Theme Options Dropdown */}
      {showOptions && (
        <div className={`
          absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl border z-50
          ${cardBg} ${border}
        `}>
          <div className="p-2">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id);
                  setShowOptions(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors
                  ${themeMode === option.id
                    ? 'bg-blue-500 text-white' 
                    : `${textPrimary} ${hoverBg}`
                  }
                `}
              >
                <option.icon className="h-5 w-5" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-xs ${
                    themeMode === option.id
                      ? 'text-blue-200'
                      : textSecondary
                  }`}>
                    {option.description}
                  </div>
                </div>
                {themeMode === option.id && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
