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

export default function Forum() {
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
  const highlight = 'text-[#00CC00]';

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
              <h1 className={`text-3xl font-bold mb-6 ${highlight}`}>
                Community Forum
              </h1>
              <div className="mb-6">
                <button className="bg-[#00CC00] text-white px-6 py-3 rounded-lg">
                  Create New Post
                </button>
              </div>
              <div className="space-y-4">
                <div className={`p-6 rounded-lg border ${border}`}>
                  <h3 className="text-xl font-semibold mb-2">Tips for Beginners</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Share your experiences and tips for new sign language learners.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Posted by User123</span>
                    <span className="mx-2">•</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <div className={`p-6 rounded-lg border ${border}`}>
                  <h3 className="text-xl font-semibold mb-2">Practice Partners</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
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
        </div>

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>
    </div>
  );
}
