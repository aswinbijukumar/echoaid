import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContextConstants';
import { API_BASE_URL } from '../constants/api';

export default function SessionManager() {
  const { user, token, refreshToken, setToken, setRefreshToken, logout } = useAuth();
  const refreshTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user || !token) {
      // Clear any existing timeouts if user logs out
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      return;
    }

    // Parse token to get expiry time
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      
      // Refresh token 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // At least 1 minute
      
      console.log(`Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
      console.log(`Will refresh token in ${Math.round(refreshTime / 1000 / 60)} minutes`);

      // Set up token refresh
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('Refreshing token...');
          const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Token refreshed successfully');
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
          } else {
            console.log('Token refresh failed, logging out');
            logout();
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          logout();
        }
      }, refreshTime);

      // Set up session warning (2 minutes before expiry)
      const warningTime = Math.max(timeUntilExpiry - (2 * 60 * 1000), 30000); // At least 30 seconds
      warningTimeoutRef.current = setTimeout(() => {
        console.warn('Session will expire in 2 minutes');
        // You can show a modal or notification here
      }, warningTime);

    } catch (error) {
      console.error('Error parsing token:', error);
      logout();
    }

    // Cleanup function
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, token, refreshToken, setToken, setRefreshToken, logout]);

  // This component doesn't render anything
  return null;
}