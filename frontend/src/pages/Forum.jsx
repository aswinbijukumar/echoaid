import { useTheme } from '../hooks/useTheme';

export default function Forum() {
  const { darkMode } = useTheme();
  const bg = darkMode ? 'bg-[#23272F]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const highlight = 'text-[#00CC00]';

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-6 ${highlight}`}>
          Community Forum
        </h1>
        <div className="mb-6">
          <button className="bg-[#00CC00] text-white px-6 py-3 rounded-lg">
            Create New Post
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Tips for Beginners</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Share your experiences and tips for new sign language learners.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span>Posted by User123</span>
              <span className="mx-2">•</span>
              <span>2 hours ago</span>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Practice Partners</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Looking for someone to practice sign language with? Connect here!
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span>Posted by SignLearner</span>
              <span className="mx-2">•</span>
              <span>1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
