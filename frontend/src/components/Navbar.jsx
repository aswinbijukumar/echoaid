import React from 'react';
import { Link } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { darkMode, setDarkMode } = useTheme();
  return (
    <nav className={`w-full ${darkMode ? 'bg-[#23272F]' : 'bg-white'} border-b-2 border-[#00CC00] z-50 flex items-center justify-between px-6 py-3 shadow-sm transition-colors duration-300`} style={{ fontFamily: 'Lato, sans-serif' }}>
      {/* Logo */}
      <Link to="/" className="font-black text-2xl md:text-3xl text-[#00CC00] select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]" aria-label="EchoAid Home">
        EchoAid
      </Link>
      <div className="flex items-center gap-4">
        {/* Dark/Light Toggle */}
        <button
          className="flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00CC00] text-[#00CC00] hover:text-[#FFC107] transition-colors"
          aria-label="Toggle dark mode"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
        <Link to="/login" className={`font-bold text-base px-4 py-2 rounded transition-colors ${darkMode ? 'text-white hover:bg-[#393E46] hover:text-[#00CC00]' : 'text-[#23272F] hover:bg-[#E0E0E0] hover:text-[#00CC00]'}`} aria-label="Login">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;
