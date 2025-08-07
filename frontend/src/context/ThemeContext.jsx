import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    const stored = localStorage.getItem('echoaid-theme-mode');
    return stored || 'system';
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return themeMode === 'dark';
  });

  const setTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('echoaid-theme-mode', mode);
  };

  const toggleTheme = () => {
    const newMode = darkMode ? 'light' : 'dark';
    setTheme(newMode);
  };

  useEffect(() => {
    const updateTheme = () => {
      if (themeMode === 'system') {
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setDarkMode(themeMode === 'dark');
      }
    };

    updateTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [themeMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      themeMode, 
      setTheme, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

