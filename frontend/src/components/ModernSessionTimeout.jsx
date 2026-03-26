import { useSessionManager } from '../hooks/useSessionManager';
import { 
  ExclamationTriangleIcon, 
  ClockIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function ModernSessionTimeout() {
  const { 
    showWarning, 
    warningTimeLeft, 
    isRefreshing, 
    refreshSession, 
    dismissWarning 
  } = useSessionManager();

  if (!showWarning) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    // Import logout from useAuth if needed
    window.location.href = '/login';
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Session Expiring Soon
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your session will expire in {formatTime(warningTimeLeft)}
              </p>
            </div>
          </div>
          <button
            onClick={dismissWarning}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${(warningTimeLeft / 300) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={refreshSession}
            disabled={isRefreshing}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs px-3 py-1.5 rounded-md flex items-center justify-center space-x-1 transition-colors"
          >
            {isRefreshing ? (
              <ArrowPathIcon className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-3 w-3" />
            )}
            <span>{isRefreshing ? 'Refreshing...' : 'Stay Logged In'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
