import { useTheme } from '../context/ThemeContext';

export default function Quiz() {
  const { darkMode } = useTheme();
  const bg = darkMode ? 'bg-[#23272F]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const highlight = 'text-[#00CC00]';

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-6 ${highlight}`}>
          Sign Language Quiz
        </h1>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Question 1 of 10</h2>
          <p className="text-lg mb-6">
            What does this sign mean?
          </p>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors">
              A) Hello
            </button>
            <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors">
              B) Thank you
            </button>
            <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors">
              C) Please
            </button>
            <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors">
              D) Goodbye
            </button>
          </div>
          <div className="mt-8 flex justify-between">
            <button className="bg-gray-500 text-white px-6 py-2 rounded-lg">
              Previous
            </button>
            <button className="bg-[#00CC00] text-white px-6 py-2 rounded-lg">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
