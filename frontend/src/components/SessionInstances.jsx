import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { 
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  GlobeAltIcon,
  ClockIcon,
  MapPinIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function SessionInstances() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokingSession, setRevokingSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(data.data);
        } else {
          setError('Failed to fetch sessions');
        }
      } else {
        setError('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      setRevokingSession(sessionId);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove session from list
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      } else {
        setError('Failed to revoke session');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      setError('Failed to revoke session');
    } finally {
      setRevokingSession(null);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'tablet':
        return <DeviceTabletIcon className="h-5 w-5" />;
      case 'desktop':
      default:
        return <ComputerDesktopIcon className="h-5 w-5" />;
    }
  };

  const getBrowserIcon = (browser) => {
    // Simple browser detection for icons
    if (browser?.toLowerCase().includes('chrome')) return '🌐';
    if (browser?.toLowerCase().includes('firefox')) return '🦊';
    if (browser?.toLowerCase().includes('safari')) return '🧭';
    if (browser?.toLowerCase().includes('edge')) return '🌍';
    return '🌐';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isCurrentSession = (session) => {
    // Check if this is likely the current session by comparing device info
    const currentUserAgent = navigator.userAgent;
    return session.deviceInfo?.userAgent === currentUserAgent;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchSessions}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <ComputerDesktopIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No active sessions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Sessions ({sessions.length})
        </h3>
        <button
          onClick={fetchSessions}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 rounded-lg border ${
              isCurrentSession(session)
                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getDeviceIcon(session.deviceInfo?.deviceType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.deviceInfo?.browser || 'Unknown Browser'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getBrowserIcon(session.deviceInfo?.browser)}
                    </span>
                    {isCurrentSession(session) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center space-x-1">
                      <GlobeAltIcon className="h-3 w-3" />
                      <span>{session.deviceInfo?.ipAddress || 'Unknown IP'}</span>
                    </div>
                    
                    {session.deviceInfo?.location?.city && (
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-3 w-3" />
                        <span>
                          {session.deviceInfo.location.city}
                          {session.deviceInfo.location.country && 
                            `, ${session.deviceInfo.location.country}`
                          }
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>Last active: {formatDate(session.lastActivity)}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Started: {formatDateTime(session.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              
              {!isCurrentSession(session) && (
                <button
                  onClick={() => revokeSession(session.id)}
                  disabled={revokingSession === session.id}
                  className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Revoke this session"
                >
                  {revokingSession === session.id ? (
                    <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <div className="flex items-start space-x-2">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Security Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Only revoke sessions you don't recognize</li>
              <li>• Sessions automatically expire after 24 hours of inactivity</li>
              <li>• The "Current" session is the one you're using right now</li>
              <li>• If you see suspicious activity, revoke all sessions and change your password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}