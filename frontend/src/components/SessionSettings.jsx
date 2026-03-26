import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { 
  Cog6ToothIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { modernSessionManager } from '../utils/modernSessionManager';

export default function SessionSettings({ isOpen, onClose }) {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [settings, setSettings] = useState({
    autoRefresh: true,
    inactivityWarning: true,
    sessionTimeout: 24, // hours
    inactivityTimeout: 2 // hours
  });

  useEffect(() => {
    if (isOpen) {
      const info = modernSessionManager.getSessionInfo();
      setSessionInfo(info);
      
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('sessionSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        const info = modernSessionManager.getSessionInfo();
        setSessionInfo(info);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('sessionSettings', JSON.stringify(newSettings));
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleRefreshSession = async () => {
    try {
      await modernSessionManager.manualRefresh();
      const info = modernSessionManager.getSessionInfo();
      setSessionInfo(info);
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Cog6ToothIcon className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Session Status */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Current Session Status
          </h4>
          
          {sessionInfo ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className="flex items-center space-x-1">
                  {sessionInfo.isValid ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className={sessionInfo.isValid ? 'text-green-600' : 'text-red-600'}>
                    {sessionInfo.isValid ? 'Active' : 'Expired'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Time until expiry:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatTime(sessionInfo.timeUntilExpiry)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last activity:</span>
                <span className="text-gray-900 dark:text-white">
                  {formatTime(sessionInfo.timeSinceActivity)} ago
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Auto-refresh:</span>
                <span className={sessionInfo.willRefreshSoon ? 'text-yellow-600' : 'text-green-600'}>
                  {sessionInfo.willRefreshSoon ? 'Soon' : 'Active'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No session information available</p>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Session Preferences
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-refresh tokens
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show inactivity warnings
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.inactivityWarning}
                  onChange={(e) => handleSettingChange('inactivityWarning', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleRefreshSession}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Refresh Session
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
