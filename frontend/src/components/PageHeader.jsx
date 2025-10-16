import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function PageHeader({ title, subtitle, rightContent, className = '' }) {
  const { darkMode } = useTheme();
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-[#23272F]'}`}>{title}</h1>
          {subtitle ? (
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>
          ) : null}
        </div>
        {rightContent ? (
          <div className="flex items-center gap-6">
            {rightContent}
          </div>
        ) : null}
      </div>
    </div>
  );
}

