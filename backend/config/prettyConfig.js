/**
 * Pretty Logging Configuration
 * Centralized configuration for all logging and environment settings
 */

import dotenv from 'dotenv';
dotenv.config();

// Environment configuration
export const ENV_CONFIG = {
  // Server URLs
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  PY_SERVICE_URL: process.env.PY_SERVICE_URL || 'http://localhost:8001',

  // Database URLs
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid_main',
  DICTIONARY_DB_URI: process.env.DICTIONARY_DB_URI || 'mongodb://localhost:27017/echoaid_dictionary',
  QUIZ_DB_URI: process.env.QUIZ_DB_URI || 'mongodb://localhost:27017/echoaid_quiz',
  FORUM_DB_URI: process.env.FORUM_DB_URI || 'mongodb://localhost:27017/echoaid_forum',
  VIDEO_DB_URI: process.env.VIDEO_DB_URI || 'mongodb://localhost:27017/echoaid_video',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  ENABLE_PRETTY_LOGS: process.env.ENABLE_PRETTY_LOGS !== 'false',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_12345',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',

  // External Services
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

// Logging categories and their configurations
export const LOG_CATEGORIES = {
  AUTH: {
    icon: '🔐',
    color: 'success',
    level: 'info'
  },
  API: {
    icon: '🌐',
    color: 'info',
    level: 'debug'
  },
  DATABASE: {
    icon: '🗄️',
    color: 'info',
    level: 'info'
  },
  GAMIFICATION: {
    icon: '🎮',
    color: 'accent',
    level: 'info'
  },
  RECOGNITION: {
    icon: '👁️',
    color: 'info',
    level: 'debug'
  },
  PRACTICE: {
    icon: '💪',
    color: 'success',
    level: 'info'
  },
  QUIZ: {
    icon: '📝',
    color: 'info',
    level: 'info'
  },
  UPLOAD: {
    icon: '📤',
    color: 'warning',
    level: 'debug'
  },
  SUBSCRIPTION: {
    icon: '💳',
    color: 'success',
    level: 'info'
  },
  SECURITY: {
    icon: '🔒',
    color: 'error',
    level: 'warning'
  },
  PERFORMANCE: {
    icon: '⚡',
    color: 'warning',
    level: 'info'
  },
  ERROR: {
    icon: '❌',
    color: 'error',
    level: 'error'
  },
  SUCCESS: {
    icon: '✅',
    color: 'success',
    level: 'info'
  },
  WARNING: {
    icon: '⚠️',
    color: 'warning',
    level: 'warning'
  },
  INFO: {
    icon: 'ℹ️',
    color: 'info',
    level: 'info'
  },
  DEBUG: {
    icon: '🔍',
    color: 'secondary',
    level: 'debug'
  }
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE: 1000, // 1 second
  DATABASE_QUERY: 500, // 500ms
  FILE_UPLOAD: 2000, // 2 seconds
  RECOGNITION: 5000, // 5 seconds
  QUIZ_GENERATION: 3000 // 3 seconds
};

// Log formatting options
export const LOG_FORMATTING = {
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  MAX_DATA_DEPTH: 3,
  MAX_STRING_LENGTH: 200,
  INCLUDE_STACK_TRACE: true,
  INCLUDE_USER_CONTEXT: true
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = ENV_CONFIG.NODE_ENV;

  switch (env) {
    case 'production':
      return {
        logLevel: 'info',
        enablePrettyLogs: false,
        enableStackTraces: false,
        enableUserContext: false,
        maxLogEntries: 1000
      };

    case 'development':
      return {
        logLevel: 'debug',
        enablePrettyLogs: true,
        enableStackTraces: true,
        enableUserContext: true,
        maxLogEntries: 10000
      };

    case 'test':
      return {
        logLevel: 'error',
        enablePrettyLogs: false,
        enableStackTraces: false,
        enableUserContext: false,
        maxLogEntries: 100
      };

    default:
      return {
        logLevel: 'info',
        enablePrettyLogs: true,
        enableStackTraces: true,
        enableUserContext: true,
        maxLogEntries: 5000
      };
  }
};

// URL helpers
export const getApiUrl = (endpoint = '') => {
  return `${ENV_CONFIG.BACKEND_URL}/api${endpoint}`;
};

export const getFrontendUrl = (path = '') => {
  return `${ENV_CONFIG.FRONTEND_URL}${path}`;
};

export const getPythonServiceUrl = (endpoint = '') => {
  return `${ENV_CONFIG.PY_SERVICE_URL}${endpoint}`;
};

// Database connection helpers
export const getDatabaseConfig = () => {
  return {
    main: ENV_CONFIG.MONGODB_URI,
    dictionary: ENV_CONFIG.DICTIONARY_DB_URI,
    quiz: ENV_CONFIG.QUIZ_DB_URI,
    forum: ENV_CONFIG.FORUM_DB_URI,
    video: ENV_CONFIG.VIDEO_DB_URI
  };
};

// Validation helpers
export const validateEnvironment = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }

  return true;
};

export default {
  ENV_CONFIG,
  LOG_CATEGORIES,
  PERFORMANCE_THRESHOLDS,
  LOG_FORMATTING,
  getEnvironmentConfig,
  getApiUrl,
  getFrontendUrl,
  getPythonServiceUrl,
  getDatabaseConfig,
  validateEnvironment
};
