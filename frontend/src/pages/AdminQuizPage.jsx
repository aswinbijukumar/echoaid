import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AdminQuizManagement from '../components/AdminQuizManagement';
import TopBarUserAvatar from '../components/TopBarUserAvatar';

export default function AdminQuizPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-6 py-3 pl-64 sticky top-0 z-30`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            {/* Empty space on the left */}
          </div>
          
          <div className="flex items-center space-x-4">
            <TopBarUserAvatar size={8} />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Left Sidebar - Navigation */}
        <Sidebar handleLogout={handleLogout} />

        {/* Main Content Area with Left Margin */}
        <div className={`flex-1 ml-64 ${bg} overflow-y-auto max-h-screen`}>
          <div className="w-full">
            <div className="flex">
              {/* Main Content */}
              <div className="flex-1 p-6 w-full">
                {/* Section Header */}
                <div className="bg-blue-500 text-white p-4 rounded-lg mb-6">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h1 className="text-sm font-medium">QUIZ MANAGEMENT</h1>
                      <h2 className="text-xl font-bold">Create, Edit & Manage Quizzes</h2>
                    </div>
                  </div>
                </div>

                {/* Admin Quiz Management Component with Scroll */}
                <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
                  <AdminQuizManagement />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle line between sidebar and content */}
        <div className="fixed left-64 top-0 h-screen w-px bg-gray-600 z-40"></div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 z-50"
          title="Scroll to top"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}