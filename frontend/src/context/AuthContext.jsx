import { useState, useEffect, useCallback } from 'react';
import { modernSessionManager } from '../utils/modernSessionManager.js';
import { API_BASE_URL } from '../constants/api.js';
import { AuthContext } from './AuthContextConstants.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  // Define logout function first
  const logout = useCallback(async () => {
    try {
      // Revoke session on server
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      // Cleanup modern session management
      modernSessionManager.destroy();
    }
  }, [refreshToken, token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          console.log('Checking authentication with token:', token.substring(0, 20) + '...');
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Authentication successful:', data.user);
            setUser(data.user);
            // Initialize modern session management for authenticated user
            modernSessionManager.initialize(
              () => logout(), // onSessionExpired
              (newToken, newRefreshToken) => { // onTokenRefreshed
                setToken(newToken);
                setRefreshToken(newRefreshToken);
              }
            );
          } else {
            console.log('Authentication failed:', response.status, response.statusText);
            // Token is invalid or expired, remove it
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setToken(null);
            setRefreshToken(null);
            setUser(null);
            modernSessionManager.destroy();
          }
        } catch (error) {
          console.error('Auth check error:', error);
          // Clear all auth data on error
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setToken(null);
          setRefreshToken(null);
          setUser(null);
          modernSessionManager.destroy();
        }
      } else {
        // No token, ensure user is null
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, logout]);

  const login = async (credentials) => {
    try {
      console.log('Attempting login for:', credentials.email);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Login failed:', response.status, data);
        // Check if user needs email verification
        if (data.needsVerification && data.userId) {
          throw new Error('EMAIL_VERIFICATION_REQUIRED');
        }
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login successful:', data.user);
      setUser(data.user);
      setToken(data.token);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      // Initialize modern session management after successful login
      modernSessionManager.initialize(
        () => logout(), // onSessionExpired
        (newToken, newRefreshToken) => { // onTokenRefreshed
          setToken(newToken);
          setRefreshToken(newRefreshToken);
        }
      );
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const googleAuth = async (googleToken) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: googleToken })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Google authentication failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const forgotPassword = async (email) => {
    // cspell:ignore forgotpassword
      const response = await fetch(`${API_BASE_URL}/api/auth/forgotpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return data;
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    signup,
    googleAuth,
    forgotPassword,
    logout,
    setToken,
    setRefreshToken,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


