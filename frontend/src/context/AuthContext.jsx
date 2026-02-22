import { useState, useEffect, useCallback } from 'react';
import { modernSessionManager } from '../utils/modernSessionManager.js';
import { API_BASE_URL } from '../constants/api.js';
import { AuthContext } from './AuthContextConstants.js';
import logger from '../utils/prettyLogger.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_token, _setToken] = useState(localStorage.getItem('token'));
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
            'Authorization': `Bearer ${_token}`
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (error) {
      logger.errorWithStack('Logout error', error, 'AUTH');
    } finally {
      setUser(null);
      _setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      // Cleanup modern session management
      modernSessionManager.destroy();
    }
  }, [refreshToken, _token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (_token) {
        try {
          logger.auth('Checking authentication', { tokenPreview: _token.substring(0, 20) + '...' }, 'AUTH');
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${_token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            logger.auth('Authentication successful', { user: data.user.name, email: data.user.email }, 'AUTH');
            setUser(data.user);
            // Initialize modern session management for authenticated user
            modernSessionManager.initialize(
              () => logout(), // onSessionExpired
              (newToken, newRefreshToken) => { // onTokenRefreshed
                _setToken(newToken);
                setRefreshToken(newRefreshToken);
              }
            );
          } else {
            // Try to parse error body
            let errorBody = {};
            try {
              errorBody = await response.clone().json();
            } catch (e) {
              errorBody = { error: 'Could not parse error body' };
            }
            // STRINGIFY the body for easier user reporting
            logger.warning('Authentication failed', { status: response.status, statusText: response.statusText }, 'AUTH');

            // Only clear token if authorized (401) or forbidden (403)
            // This prevents logout on server errors (500) or network issues
            if (response.status === 401 || response.status === 403) {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              _setToken(null);
              setRefreshToken(null);
              setUser(null);
              modernSessionManager.destroy();
            }
          }
        } catch (error) {
          logger.errorWithStack('Auth check error', error, 'AUTH');
          // Clear all auth data on error
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          _setToken(null);
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
  }, [_token, logout]);

  const login = async (credentials) => {
    try {
      logger.auth('Attempting login', { email: credentials.email }, 'AUTH');
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        logger.warning('Login failed', { status: response.status, data }, 'AUTH');
        // Check if user needs email verification
        if (data.needsVerification && data.userId) {
          throw new Error('EMAIL_VERIFICATION_REQUIRED');
        }
        throw new Error(data.message || 'Login failed');
      }

      logger.auth('Login successful', { user: data.user.name, email: data.user.email }, 'AUTH');
      setUser(data.user);
      _setToken(data.token);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      // Initialize modern session management after successful login
      modernSessionManager.initialize(
        () => logout(), // onSessionExpired
        (newToken, newRefreshToken) => { // onTokenRefreshed
          _setToken(newToken);
          setRefreshToken(newRefreshToken);
        }
      );
      return data;
    } catch (error) {
      logger.errorWithStack('Login error', error, 'AUTH');
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
    _setToken(data.token);
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
    _setToken(data.token);
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

  const refreshUser = useCallback(async () => {
    if (_token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          return data.user;
        }
      } catch (error) {
        logger.errorWithStack('Error refreshing user data', error, 'AUTH');
      }
    }
    return null;
  }, [_token]);

  const setToken = useCallback((newToken) => {
    _setToken(newToken);
    if (newToken) {
      setLoading(true); // Set loading true immediately to prevent race conditions
    }
  }, []);

  const value = {
    user,
    token: _token,
    refreshToken,
    loading,
    login,
    signup,
    googleAuth,
    forgotPassword,
    logout,
    refreshUser,
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


