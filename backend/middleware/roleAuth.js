import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log('Protect middleware - Token present:', !!token);

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      console.log('User account is deactivated');
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    console.log('User authenticated successfully:', user.email, 'role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware - User role:', req.user?.role, 'Required roles:', roles);
    
    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('User role not authorized:', req.user.role, 'not in', roles);
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    console.log('User authorized successfully');
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
export const superAdminOnly = authorize('super_admin');

// Admin and Super Admin
export const adminAndSuperAdmin = authorize('admin', 'super_admin');

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