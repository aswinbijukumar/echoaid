import { useTheme } from '../context/ThemeContext';

export default function AccessibilitySettings() {
  const { darkMode } = useTheme();
  const bg = darkMode ? 'bg-[#23272F]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const highlight = 'text-[#00CC00]';

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-6 ${highlight}`}>
          Accessibility Settings
        </h1>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <p className="text-lg mb-4">
            Configure accessibility options for your EchoAid experience.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>High Contrast Mode</span>
              <button className="bg-[#00CC00] text-white px-4 py-2 rounded">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Screen Reader Support</span>
              <button className="bg-[#00CC00] text-white px-4 py-2 rounded">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Font Size</span>
              <select className="bg-white dark:bg-gray-700 border rounded px-3 py-2">
                <option>Normal</option>
                <option>Large</option>
                <option>Extra Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
