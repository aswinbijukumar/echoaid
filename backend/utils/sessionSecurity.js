import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserSession from '../models/UserSession.js';
import User from '../models/User.js';

// Enhanced session security utilities
export class SessionSecurity {
  constructor() {
    this.MAX_CONCURRENT_SESSIONS = 5; // Max sessions per user
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes inactivity
    this.REFRESH_TOKEN_LENGTH = 64; // 64 character refresh token
  }

  // Generate secure refresh token
  generateRefreshToken() {
    return crypto.randomBytes(this.REFRESH_TOKEN_LENGTH).toString('hex');
  }

  // Extract device info from request
  extractDeviceInfo(req) {
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Basic device detection
    let deviceType = 'desktop';
    let browser = 'unknown';
    let os = 'unknown';

    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    if (/chrome/i.test(userAgent)) browser = 'chrome';
    else if (/firefox/i.test(userAgent)) browser = 'firefox';
    else if (/safari/i.test(userAgent)) browser = 'safari';
    else if (/edge/i.test(userAgent)) browser = 'edge';

    if (/windows/i.test(userAgent)) os = 'windows';
    else if (/mac/i.test(userAgent)) os = 'macos';
    else if (/linux/i.test(userAgent)) os = 'linux';
    else if (/android/i.test(userAgent)) os = 'android';
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'ios';

    return {
      userAgent,
      ipAddress,
      deviceType,
      browser,
      os
    };
  }

  // Create new session
  async createSession(userId, req) {
    try {
      // Check concurrent session limit
      const activeSessions = await UserSession.countDocuments({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (activeSessions >= this.MAX_CONCURRENT_SESSIONS) {
        // Remove oldest session
        const oldestSession = await UserSession.findOne({
          userId,
          isActive: true
        }).sort({ lastActivity: 1 });

        if (oldestSession) {
          await UserSession.findByIdAndUpdate(oldestSession._id, {
            isActive: false
          });
        }
      }

      const refreshToken = this.generateRefreshToken();
      const deviceInfo = this.extractDeviceInfo(req);
      
      const session = new UserSession({
        userId,
        refreshToken,
        deviceInfo,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Validate refresh token
  async validateRefreshToken(refreshToken) {
    try {
      const session = await UserSession.findOne({
        refreshToken,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).populate('userId');

      if (!session) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      await session.save();

      return session;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }
  }

  // Revoke session
  async revokeSession(refreshToken) {
    try {
      await UserSession.findOneAndUpdate(
        { refreshToken },
        { isActive: false }
      );
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  }

  // Revoke all user sessions
  async revokeAllUserSessions(userId) {
    try {
      await UserSession.updateMany(
        { userId, isActive: true },
        { isActive: false }
      );
    } catch (error) {
      console.error('Error revoking all user sessions:', error);
    }
  }

  // Get user active sessions
  async getUserSessions(userId) {
    try {
      return await UserSession.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).sort({ lastActivity: -1 });
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Check for suspicious activity
  async checkSuspiciousActivity(userId, req) {
    try {
      const deviceInfo = this.extractDeviceInfo(req);
      const recentSessions = await UserSession.find({
        userId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      // Check for multiple locations
      const uniqueIPs = new Set(recentSessions.map(s => s.deviceInfo.ipAddress));
      if (uniqueIPs.size > 3) {
        return {
          suspicious: true,
          reason: 'Multiple IP addresses detected',
          severity: 'medium'
        };
      }

      // Check for rapid session creation
      if (recentSessions.length > 10) {
        return {
          suspicious: true,
          reason: 'Too many sessions created',
          severity: 'high'
        };
      }

      return { suspicious: false };
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return { suspicious: false };
    }
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions() {
    try {
      const result = await UserSession.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }
}

export default new SessionSecurity();