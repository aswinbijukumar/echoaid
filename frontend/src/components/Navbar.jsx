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
    <nav className={`fixed top-0 left-0 w-full ${bg} ${border} border-b-2 z-50 transition-all duration-500 shadow-xl`} style={{ fontFamily: 'Lato, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00CC00] to-[#00AA00] rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-black text-xl">E</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFC107] rounded-full animate-pulse shadow-lg"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-3xl text-[#00CC00] leading-none">EchoAid</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Learn • Connect • Grow</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/login" 
              className={`${text} font-bold text-base px-8 py-3 rounded-xl border-2 border-[#00CC00] ${hoverBg} transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50`}
            >
              Login
            </Link>
            
            {/* Enhanced Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`relative ${text} p-4 rounded-xl ${hoverBg} transition-all duration-500 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50 group`}
              aria-label="Toggle theme"
            >
              <div className="relative">
                {darkMode ? (
                  <SunIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <MoonIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                )}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00CC00] rounded-full animate-pulse"></div>
              </div>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Enhanced Theme Toggle Button for Mobile */}
            <button
              onClick={toggleTheme}
              className={`relative ${text} p-4 rounded-xl ${hoverBg} transition-all duration-500 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50 group`}
              aria-label="Toggle theme"
            >
              <div className="relative">
                {darkMode ? (
                  <SunIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <MoonIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                )}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00CC00] rounded-full animate-pulse"></div>
              </div>
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${text} p-4 rounded-xl ${hoverBg} transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#00CC00]/50`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-7 h-7" />
              ) : (
                <Bars3Icon className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-4 pt-4 pb-6 space-y-3 ${bg} rounded-2xl mt-4 shadow-2xl border border-gray-200 dark:border-gray-700`}>
              <Link 
                to="/login" 
                className={`${text} block px-6 py-4 rounded-xl text-lg font-bold ${hoverBg} transition-all duration-300 hover:scale-105 border-2 border-[#00CC00]`}
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
