import { Link, useLocation } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartPieIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ handleLogout }) {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  
  // Base links for all users
  const baseLinks = [
    { to: '/dashboard', label: 'LEARN', icon: AcademicCapIcon },
    { to: '/dictionary', label: 'DICTIONARY', icon: BookOpenIcon },
    { to: '/quiz', label: 'QUIZ', icon: PuzzlePieceIcon },
    { to: '/accessibility', label: 'SETTINGS', icon: Cog6ToothIcon },
    { to: '/profile', label: 'PROFILE', icon: UserCircleIcon },
  ];

  // Admin links - organized with all admin functions
  const adminLinks = [
    { to: '/admin?tab=overview', label: 'DASHBOARD OVERVIEW', icon: ChartBarIcon },
    { to: '/admin?tab=content', label: 'SIGN MANAGEMENT', icon: DocumentTextIcon },
    { to: '/admin?tab=users', label: 'USER MANAGEMENT', icon: UsersIcon },
    { to: '/admin?tab=analytics', label: 'SECTION ANALYTICS', icon: ChartPieIcon },
    
    { to: '/admin/quiz', label: 'MANAGE QUIZZES', icon: PuzzlePieceIcon },
    { to: '/profile', label: 'PROFILE', icon: UserCircleIcon },
  ];

  // Super Admin links - focuses on user and admin management
  const superAdminLinks = [
    { to: '/super-admin', label: 'SUPER ADMIN', icon: ShieldCheckIcon },
    { to: '/admin?tab=users', label: 'USER MANAGEMENT', icon: UsersIcon },
    // Super admin system analytics lives inside the Super Admin page
    // Keep a simple link to the Super Admin console instead of admin analytics
    // { to: '/super-admin?tab=analytics', label: 'SYSTEM ANALYTICS', icon: ChartPieIcon },
    { to: '/profile', label: 'PROFILE', icon: UserCircleIcon },
  ];

  // Choose links based on user role
  let links = baseLinks;
  if (user?.role === 'super_admin') {
    links = superAdminLinks;
  } else if (user?.role === 'admin') {
    links = adminLinks;
  }
  return (
    <div className={`fixed left-0 top-0 h-screen w-64 ${darkMode ? 'bg-[#1A1A1A]' : 'bg-gray-100'} z-50 pt-4`}>
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
            // Enhanced active state detection for admin dashboard tabs
            let isActive = false;
            if (to.includes('?tab=')) {
              // For admin dashboard tabs, check both pathname and search params
              const [pathname, searchParams] = to.split('?');
              const currentSearchParams = new URLSearchParams(location.search);
              const targetTab = new URLSearchParams(searchParams).get('tab');
              const currentTab = currentSearchParams.get('tab');
              
              isActive = location.pathname === pathname && 
                        (targetTab === currentTab || (!currentTab && targetTab === 'overview'));
            } else {
              // For regular links, just check pathname
              isActive = location.pathname === to;
            }
            
            // Add extra spacing before Profile
            const extraSpacing = label === 'PROFILE' ? 'mt-4' : '';
            return (
              <Link
                key={to}
                to={to}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center space-x-3 p-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${extraSpacing}
                  ${isActive
                    ? 'bg-green-500 text-white shadow-lg transform scale-105'
                    : darkMode
                      ? 'text-white hover:bg-[#23272F] hover:transform hover:scale-[1.02] focus:bg-[#23272F]'
                      : 'text-gray-900 hover:bg-gray-200 hover:transform hover:scale-[1.02] focus:bg-gray-200'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : darkMode ? 'text-white' : 'text-gray-900'}`} />
                <span>{label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
          <div className={`border-t pt-2 mt-4 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 p-3 rounded-lg font-semibold w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
                ${darkMode ? 'text-white hover:bg-red-600 hover:bg-opacity-20 focus:bg-red-600 focus:bg-opacity-20' : 'text-gray-900 hover:bg-red-100 focus:bg-red-100'}`}
            >
              <ArrowRightOnRectangleIcon className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              <span>LOGOUT</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
