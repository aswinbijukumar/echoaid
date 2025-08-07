import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  HandRaisedIcon,
  ShieldCheckIcon,
  GiftIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function Quiz() {
  const [currentStreak] = useState(7);
  const [totalXP] = useState(1250);
  const [lives] = useState(5);
  
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-4 py-3`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            {/* Empty space on the left */}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">{currentStreak}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{totalXP}</span>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-red-400" />
              <span className="font-semibold">{lives}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-8 h-8 text-gray-300" />
              <span className="font-semibold">{user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area */}
        <div className={`flex-1 ml-64 ${bg}`}>
          <div className="max-w-6xl mx-auto">
            <div className="p-6">
              <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>
                Sign Language Quiz
              </h1>
              <div className={`p-8 rounded-lg border ${border}`}>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Question 1 of 10</h2>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  What does this sign mean?
                </p>
                <div className="space-y-3">
                  <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors text-gray-900 font-semibold">
                    A) Hello
                  </button>
                  <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors text-gray-900 font-semibold">
                    B) Thank you
                  </button>
                  <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors text-gray-900 font-semibold">
                    C) Please
                  </button>
                  <button className="w-full text-left p-4 bg-white dark:bg-gray-700 rounded-lg border hover:border-[#00CC00] transition-colors text-gray-900 font-semibold">
                    D) Goodbye
                  </button>
                </div>
                <div className="mt-8 flex justify-between">
                  <button className="bg-gray-500 text-white px-6 py-2 rounded-lg text-gray-900 font-semibold">
                    Previous
                  </button>
                  <button className="bg-[#00CC00] text-white px-6 py-2 rounded-lg text-gray-900 font-semibold">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>
    </div>
  );
}
