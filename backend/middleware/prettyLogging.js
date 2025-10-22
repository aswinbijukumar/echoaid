/**
 * Pretty Logging Middleware
 * Centralized logging middleware for all API requests and responses
 */

import logger from '../utils/prettyLogger.js';
import { ENV_CONFIG, PERFORMANCE_THRESHOLDS } from '../config/prettyConfig.js';

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Log request details
  logger.api(req.method, req.url, 'PENDING', null, 'REQUEST');
  
  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const sanitizedBody = sanitizeRequestBody(req.body);
    logger.debug('Request body', sanitizedBody, 'REQUEST');
  }
  
  // Log user context if available
  if (req.user) {
    logger.debug('User context', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role
    }, 'AUTH');
  }
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.api(req.method, req.url, res.statusCode, duration, 'RESPONSE');
    
    // Log performance warnings
    if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE) {
      logger.performance(`Slow API response: ${req.method} ${req.url}`, duration, PERFORMANCE_THRESHOLDS.API_RESPONSE);
    }
    
    // Log response data for debugging (in development)
    if (ENV_CONFIG.NODE_ENV === 'development' && data) {
      const sanitizedData = sanitizeResponseData(data);
      logger.debug('Response data', sanitizedData, 'RESPONSE');
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // Log error with context
  logger.errorWithStack(`Request error: ${req.method} ${req.url}`, err, 'ERROR');
  
  // Log error context
  logger.debug('Error context', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    } : null
  }, 'ERROR');
  
  next(err);
};

// Database operation logging
export const databaseLogger = (operation, collection, query = null, result = null, duration = null) => {
  logger.database(operation, collection, result, 'DATABASE');
  
  if (duration && duration > PERFORMANCE_THRESHOLDS.DATABASE_QUERY) {
    logger.performance(`Slow database operation: ${operation} ${collection}`, duration, PERFORMANCE_THRESHOLDS.DATABASE_QUERY);
  }
  
  if (query) {
    logger.debug('Database query', query, 'DATABASE');
  }
};

// Authentication logging
export const authLogger = (action, user = null, success = true, details = null) => {
  const level = success ? 'info' : 'warning';
  const message = `${action}${user ? ` for ${user.email || user.id}` : ''}`;
  
  logger.auth(message, details, 'AUTH');
  
  if (!success) {
    logger.security(`Failed authentication attempt: ${action}`, {
      user: user ? { id: user.id, email: user.email } : null,
      details
    }, 'SECURITY');
  }
};

// Gamification logging
export const gamificationLogger = (action, userId, data = null) => {
  logger.gamification(`${action} for user ${userId}`, data, 'GAMIFICATION');
};

// Recognition logging
export const recognitionLogger = (action, data = null, duration = null) => {
  logger.recognition(action, data, 'RECOGNITION');
  
  if (duration && duration > PERFORMANCE_THRESHOLDS.RECOGNITION) {
    logger.performance(`Slow recognition: ${action}`, duration, PERFORMANCE_THRESHOLDS.RECOGNITION);
  }
};

// Security logging
export const securityLogger = (event, details = null, severity = 'warning') => {
  logger.security(event, details, 'SECURITY');
  
  // Log to security monitoring system if available
  if (ENV_CONFIG.NODE_ENV === 'production') {
    // TODO: Integrate with security monitoring service
    console.log(`[SECURITY] ${event}:`, details);
  }
};

// Performance monitoring
export const performanceLogger = (operation, duration, threshold = null) => {
  const actualThreshold = threshold || PERFORMANCE_THRESHOLDS.API_RESPONSE;
  
  if (duration > actualThreshold) {
    logger.performance(`Slow operation: ${operation}`, duration, actualThreshold);
  } else {
    logger.debug(`Operation completed: ${operation}`, { duration }, 'PERFORMANCE');
  }
};

// Utility functions
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

const sanitizeResponseData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  // Remove sensitive fields from response
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Limit data size for logging
  if (JSON.stringify(sanitized).length > 1000) {
    return { ...sanitized, _truncated: true };
  }
  
  return sanitized;
};

// Export all logging functions
export default {
  requestLogger,
  errorLogger,
  databaseLogger,
  authLogger,
  gamificationLogger,
  recognitionLogger,
  securityLogger,
  performanceLogger
};