// Modern Session Management System
// Handles background token refresh, activity tracking, and session management
// without intrusive UI elements

import { ENV_CONFIG } from '../config/prettyConfig.js';

export class ModernSessionManager {
  constructor() {
    this.SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
    this.REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes before expiry
    this.INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours of inactivity
    this.ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
    this.WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
    
    this.lastActivity = Date.now();
    this.refreshTimer = null;
    this.activityTimer = null;
    this.checkTimer = null;
    this.warningTimer = null;
    this.isRefreshing = false;
    this.onSessionExpired = null;
    this.onTokenRefreshed = null;
    this.onSessionWarning = null;
    this.onActivityUpdate = null;
    
    // Activity tracking events
    this.activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus', 'blur'
    ];
    
    // Session state
    this.sessionState = {
      isValid: false,
      timeUntilExpiry: 0,
      timeSinceActivity: 0,
      isActive: true,
      willRefreshSoon: false,
      needsWarning: false
    };
  }

  // Initialize session management
  initialize(onSessionExpired, onTokenRefreshed, onSessionWarning, onActivityUpdate) {
    this.onSessionExpired = onSessionExpired;
    this.onTokenRefreshed = onTokenRefreshed;
    this.onSessionWarning = onSessionWarning;
    this.onActivityUpdate = onActivityUpdate;
    
    this.setupActivityTracking();
    this.startSessionMonitoring();
    
    console.log('Modern session manager initialized');
  }

  // Setup activity tracking
  setupActivityTracking() {
    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.updateSessionState();
      
      // Notify components of activity update
      if (this.onActivityUpdate) {
        this.onActivityUpdate(this.sessionState);
      }
    };

    this.activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  // Start session monitoring
  startSessionMonitoring() {
    // Check session status every 5 minutes
    this.checkTimer = setInterval(() => {
      this.checkSessionStatus();
    }, this.ACTIVITY_CHECK_INTERVAL);

    // Check token expiry every minute
    this.refreshTimer = setInterval(() => {
      this.checkTokenExpiry();
    }, 60000);

    // Update session state every 30 seconds
    this.stateUpdateTimer = setInterval(() => {
      this.updateSessionState();
    }, 30000);
  }

  // Check overall session status
  checkSessionStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.handleSessionExpired();
      return;
    }

    // Check inactivity
    const timeSinceActivity = Date.now() - this.lastActivity;
    if (timeSinceActivity > this.INACTIVITY_TIMEOUT) {
      console.log('Session expired due to inactivity');
      this.handleSessionExpired();
      return;
    }

    // Check token validity
    if (!this.isTokenValid(token)) {
      console.log('Token is invalid');
      this.handleSessionExpired();
      return;
    }
  }

  // Check token expiry and refresh if needed
  checkTokenExpiry() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiry - now;

      // If token expires within refresh threshold, refresh it
      if (timeUntilExpiry < this.REFRESH_THRESHOLD && timeUntilExpiry > 0) {
        this.refreshToken();
      } else if (timeUntilExpiry <= 0) {
        this.handleSessionExpired();
      }

      // Check for warning threshold
      if (timeUntilExpiry < this.WARNING_THRESHOLD && timeUntilExpiry > 0 && !this.sessionState.needsWarning) {
        this.sessionState.needsWarning = true;
        if (this.onSessionWarning) {
          this.onSessionWarning(timeUntilExpiry);
        }
      }
    } catch (error) {
      console.error('Token parsing error:', error);
      this.handleSessionExpired();
    }
  }

  // Update session state
  updateSessionState() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.sessionState.isValid = false;
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      const timeSinceActivity = now - this.lastActivity;

      this.sessionState = {
        isValid: timeUntilExpiry > 0,
        timeUntilExpiry: Math.max(0, timeUntilExpiry),
        timeSinceActivity,
        isActive: timeSinceActivity < this.INACTIVITY_TIMEOUT,
        willRefreshSoon: timeUntilExpiry < this.REFRESH_THRESHOLD,
        needsWarning: timeUntilExpiry < this.WARNING_THRESHOLD && timeUntilExpiry > 0
      };
    } catch (error) {
      this.sessionState.isValid = false;
    }
  }

  // Refresh token in background
  async refreshToken() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        console.log('Token refreshed successfully in background');
        
        // Notify callback
        if (this.onTokenRefreshed) {
          this.onTokenRefreshed(data.token, data.refreshToken);
        }
        
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Background token refresh failed:', error);
      this.handleSessionExpired();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Handle session expiration
  handleSessionExpired() {
    console.log('Session expired, cleaning up...');
    this.cleanup();
    
    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
  }

  // Check if token is valid
  isTokenValid(token) {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch (error) {
      return false;
    }
  }

  // Get session info
  getSessionInfo() {
    this.updateSessionState();
    return { ...this.sessionState };
  }

  // Get current session state
  getSessionState() {
    return { ...this.sessionState };
  }

  // Manual session refresh (for user-initiated actions)
  async manualRefresh() {
    return await this.refreshToken();
  }

  // Extend session (reset activity timer)
  extendSession() {
    this.lastActivity = Date.now();
    console.log('Session extended due to user activity');
  }

  // Cleanup resources
  cleanup() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    if (this.stateUpdateTimer) {
      clearInterval(this.stateUpdateTimer);
      this.stateUpdateTimer = null;
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }

    // Remove event listeners
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, () => {});
    });
  }

  // Destroy session manager
  destroy() {
    this.cleanup();
    this.onSessionExpired = null;
    this.onTokenRefreshed = null;
  }
}

// Create global instance
export const modernSessionManager = new ModernSessionManager();