import { useState, useContext } from 'react';
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
import { ThemeContext } from '../context/ThemeContext.js';
import Sidebar from '../components/Sidebar';

export default function AccessibilitySettings() {
  const [currentStreak] = useState(7);
  const [totalXP] = useState(1250);
  const [lives] = useState(5);
  
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const { themeMode, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-gray-600' : 'border-gray-300';
  const statusBarBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Top Status Bar */}
      <div className={`${statusBarBg} border-b ${border} px-4 py-3`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4"></div>
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

        {/* Main Content Area - Duolingo-style Settings Layout */}
        <div className={`flex-1 ml-64 ${bg} min-h-screen flex justify-center items-start py-12`}>
          <div className="flex w-full max-w-5xl gap-8">
            {/* Left: Preferences */}
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Preferences</h2>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Lesson experience</h3>
                  <hr className="border-gray-700 mb-4" />
                  <Toggle label="Sound effects" />
                  <Toggle label="Animations" />
                  <Toggle label="Motivational messages" />
                  <Toggle label="Sign animation speed" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Appearance</h3>
                  <hr className="border-gray-700 mb-4" />
                  <div className="flex items-center justify-between py-3">
                    <span>Dark mode</span>
                    <select 
                      value={themeMode} 
                      onChange={handleThemeChange}
                      className="bg-[#23272F] border border-gray-700 text-white rounded px-3 py-2 focus:outline-none"
                    >
                      <option value="system">SYSTEM DEFAULT</option>
                      <option value="light">LIGHT</option>
                      <option value="dark">DARK</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Account/Subscription/Support */}
            <div className="w-80 space-y-6">
              <div className={`p-6 rounded-xl border ${border}`}>
                <h3 className="font-bold text-lg mb-4">Account</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/accessibility" className="font-semibold text-green-400">Preferences</Link>
                  <Link to="/profile" className="hover:text-green-400">Profile</Link>
                  <Link to="/notifications" className="hover:text-green-400">Notifications</Link>
                  <Link to="/courses" className="hover:text-green-400">My Learning Paths</Link>
                  <Link to="/social" className="hover:text-green-400">Social accounts</Link>
                  <Link to="/privacy" className="hover:text-green-400">Privacy settings</Link>
                </div>
              </div>
              <div className={`p-6 rounded-xl border ${border}`}>
                <h3 className="font-bold text-lg mb-4">Subscription</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/subscription" className="hover:text-green-400">Choose a plan</Link>
                </div>
              </div>
              <div className={`p-6 rounded-xl border ${border}`}>
                <h3 className="font-bold text-lg mb-4">Support</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/help" className="hover:text-green-400">Help Center</Link>
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

// Toggle component for settings
function Toggle({ label, initialState = true }) {
  const [enabled, setEnabled] = useState(initialState);
  return (
    <div className="flex items-center justify-between py-3">
      <span>{label}</span>
      <button
        className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${enabled ? 'bg-blue-500' : 'bg-gray-600'}`}
        onClick={() => setEnabled(!enabled)}
        aria-pressed={enabled}
      >
        <span
          className={`h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
}
