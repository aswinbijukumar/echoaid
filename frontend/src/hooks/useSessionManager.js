import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { modernSessionManager } from '../utils/modernSessionManager';

export const useSessionManager = () => {
  const { logout, setToken, setRefreshToken } = useAuth();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimeLeft, setWarningTimeLeft] = useState(0);

  // Initialize session manager
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('Session expired, logging out...');
      logout();
    };

    const handleTokenRefreshed = (newToken, newRefreshToken) => {
      console.log('Token refreshed successfully');
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setSessionInfo(modernSessionManager.getSessionInfo());
    };

    const handleSessionWarning = (timeUntilExpiry) => {
      console.log('Session warning triggered');
      setShowWarning(true);
      setWarningTimeLeft(Math.ceil(timeUntilExpiry / 1000));
    };

    const handleActivityUpdate = (sessionState) => {
      setSessionInfo(sessionState);
    };

    // Initialize the session manager
    modernSessionManager.initialize(
      handleSessionExpired,
      handleTokenRefreshed,
      handleSessionWarning,
      handleActivityUpdate
    );

    // Get initial session info
    setSessionInfo(modernSessionManager.getSessionInfo());

    // Cleanup on unmount
    return () => {
      modernSessionManager.destroy();
    };
  }, [logout, setToken, setRefreshToken]);

  // Manual session refresh
  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const success = await modernSessionManager.manualRefresh();
      if (success) {
        setSessionInfo(modernSessionManager.getSessionInfo());
        setShowWarning(false);
        setWarningTimeLeft(0);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [logout]);

  // Extend session (reset activity timer)
  const extendSession = useCallback(() => {
    modernSessionManager.extendSession();
    setSessionInfo(modernSessionManager.getSessionInfo());
  }, []);

  // Dismiss warning
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    setWarningTimeLeft(0);
  }, []);

  // Format time until expiry
  const formatTimeUntilExpiry = useCallback((milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // Update warning countdown
  useEffect(() => {
    let countdownInterval;
    
    if (showWarning && warningTimeLeft > 0) {
      countdownInterval = setInterval(() => {
        setWarningTimeLeft(prev => {
          if (prev <= 1) {
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showWarning, warningTimeLeft, logout]);

  return {
    sessionInfo,
    isRefreshing,
    showWarning,
    warningTimeLeft,
    refreshSession,
    extendSession,
    dismissWarning,
    formatTimeUntilExpiry,
    isSessionValid: sessionInfo?.isValid || false,
    isSessionActive: sessionInfo?.isActive || false,
    willRefreshSoon: sessionInfo?.willRefreshSoon || false
  };
};