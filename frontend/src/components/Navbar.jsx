import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const bg = darkMode ? 'bg-[#1A1A1A]/95 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md';
  const text = darkMode ? 'text-white' : 'text-[#23272F]';
  const border = darkMode ? 'border-[#00CC00]' : 'border-[#00CC00]';
  const hoverBg = darkMode ? 'hover:bg-[#00CC00]/10' : 'hover:bg-[#00CC00]/5';

  return (
    <nav className={`fixed top-0 left-0 w-full ${bg} ${border} border-b-2 z-50 transition-all duration-300 shadow-lg`} style={{ fontFamily: 'Lato, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFC107] rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-[#00CC00] leading-none">EchoAid</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Learn • Connect • Grow</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/login" 
              className={`${text} font-semibold text-sm px-6 py-2 rounded-lg border border-[#00CC00] ${hoverBg} transition-all duration-200 hover:scale-105`}
            >
              Login
            </Link>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`${text} p-3 rounded-xl ${hoverBg} transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00]/50`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Theme Toggle Button for Mobile */}
            <button
              onClick={toggleTheme}
              className={`${text} p-3 rounded-xl ${hoverBg} transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00CC00]/50`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${text} p-3 rounded-xl ${hoverBg} transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#00CC00]/50`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-3 pt-3 pb-4 space-y-2 ${bg} rounded-xl mt-2 shadow-xl border border-gray-200 dark:border-gray-700`}>
              <Link 
                to="/login" 
                className={`${text} block px-4 py-3 rounded-lg text-base font-medium ${hoverBg} transition-all duration-200 hover:scale-105`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
