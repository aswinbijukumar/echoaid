import jwt from 'jsonwebtoken';
import logger from '../utils/prettyLogger.js';
import User from '../models/User.js';
import { ENV_CONFIG } from '../config/prettyConfig.js';

// Protect routes - verify token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  logger.debug('Protect middleware - Token present:', !!token, 'CONTROLLER');
  if (req.headers.authorization) {
    logger.debug('Authorization Header:', req.headers.authorization.substring(0, 20) + '...', 'CONTROLLER');
  } else {
    logger.debug('Authorization Header: MISSING', null, 'CONTROLLER');
  }

  if (!token) {
    logger.info('No token found in request', null, 'CONTROLLER');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    logger.debug('Verifying token:', token.substring(0, 20) + '...', 'CONTROLLER');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || ENV_CONFIG.JWT_SECRET || 'secret_fallback_123');
    logger.debug('Token decoded successfully, user ID:', decoded.id, 'CONTROLLER');

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      logger.info('User not found in database', null, 'CONTROLLER');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.debug('User found. Keys:', Object.keys(user.toObject()), 'isActive value:', user.isActive, 'AUTH');

    if (!user.isActive) {
      logger.warning('User account is deactivated', { userId: user._id }, 'AUTH');
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    logger.debug('User authenticated successfully:', { email: user.email, role: user.role }, 'AUTH');
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', { error: error.message }, 'AUTH');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check specific permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission ${permission} is required to access this route`
      });
    }

    next();
  };
};

// Super Admin only

// Admin and Super Admin
export const adminAndSuperAdmin = authorize('admin');

// Check if user can manage specific content
export const canManageContent = (req, res, next) => {
  if (!req.user.permissions.manageContent) {
    return res.status(403).json({
      success: false,
      message: 'Content management permission required'
    });
  }
  next();
};

// Check if user can manage users
export const canManageUsers = (req, res, next) => {
  if (!req.user.permissions.manageUsers) {
    return res.status(403).json({
      success: false,
      message: 'User management permission required'
    });
  }
  next();
};

// Check if user can view analytics
export const canViewAnalytics = (req, res, next) => {
  if (!req.user.permissions.viewAnalytics) {
    return res.status(403).json({
      success: false,
      message: 'Analytics permission required'
    });
  }
  next();
}; 
