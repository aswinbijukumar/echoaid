import { Link, useLocation } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  GiftIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

export default function Sidebar({ handleLogout }) {
  const { darkMode } = useTheme();
  const location = useLocation();
  const links = [
    { to: '/dashboard', label: 'LEARN', icon: AcademicCapIcon },
    { to: '/dictionary', label: 'DICTIONARY', icon: BookOpenIcon },
    { to: '/forum', label: 'COMMUNITY', icon: ChatBubbleLeftRightIcon },
    { to: '/quiz', label: 'QUIZ', icon: PuzzlePieceIcon },
    { to: '/accessibility', label: 'SETTINGS', icon: Cog6ToothIcon },
    { to: '/leaderboard', label: 'LEADERBOARD', icon: ShieldCheckIcon },
    { to: '/quests', label: 'QUESTS', icon: GiftIcon },
    { to: '/shop', label: 'SHOP', icon: ShoppingBagIcon },
    { to: '/profile', label: 'PROFILE', icon: UserCircleIcon },
  ];
  return (
    <div className={`fixed left-0 top-0 h-screen w-64 ${darkMode ? 'bg-[#181C1F]' : 'bg-gray-100'} z-50 pt-4`}>
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">E</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#00CC00]/20 rounded-full animate-ping"></div>
          </div>
          <span className="font-black text-xl text-[#00CC00]">EchoAid</span>
        </div>
        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }, idx) => {
            const isActive = location.pathname === to;
            // Add extra spacing before Profile
            const extraSpacing = label === 'PROFILE' ? 'mt-4' : '';
            return (
              <Link
                key={to}
                to={to}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center space-x-3 p-3 rounded-lg font-semibold transition-colors ${extraSpacing}
                  ${isActive
                    ? 'bg-green-500 text-white'
                    : darkMode
                      ? 'text-white hover:bg-[#23272F]'
                      : 'text-gray-900 hover:bg-gray-200'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
          <div className={`border-t pt-2 mt-4 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 p-3 rounded-lg font-semibold w-full transition-colors
                ${darkMode ? 'text-white hover:bg-[#23272F]' : 'text-gray-900 hover:bg-gray-200'}`}
            >
              <EllipsisHorizontalIcon className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              <span>MORE</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}