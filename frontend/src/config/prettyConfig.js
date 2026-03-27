/**
 * Frontend Pretty Logging Configuration
 * Centralized configuration for frontend logging and environment settings
 */

// Environment configuration
export const ENV_CONFIG = {
  // API URLs
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  PY_SERVICE_URL: import.meta.env.VITE_PY_SERVICE_URL || 'http://localhost:8001',
  
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Logging
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'debug',
  ENABLE_PRETTY_LOGS: import.meta.env.VITE_ENABLE_PRETTY_LOGS !== 'false',
  
  // Features
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true'
};

// Logging categories for frontend
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
  UI: {
    icon: '🎨',
    color: 'accent',
    level: 'debug'
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
  NAVIGATION: {
    icon: '🧭',
    color: 'info',
    level: 'debug'
  },
  STATE: {
    icon: '🔄',
    color: 'secondary',
    level: 'debug'
  },
  COMPONENT: {
    icon: '🧩',
    color: 'info',
    level: 'debug'
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

// Performance thresholds for frontend
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE: 2000, // 2 seconds
  COMPONENT_RENDER: 100, // 100ms
  NAVIGATION: 500, // 500ms
  IMAGE_LOAD: 3000, // 3 seconds
  RECOGNITION: 5000, // 5 seconds
  QUIZ_LOAD: 2000 // 2 seconds
};

// Log formatting options
export const LOG_FORMATTING = {
  TIMESTAMP_FORMAT: 'HH:mm:ss',
  MAX_DATA_DEPTH: 2,
  MAX_STRING_LENGTH: 150,
  INCLUDE_STACK_TRACE: true,
  INCLUDE_USER_CONTEXT: true,
  INCLUDE_COMPONENT_CONTEXT: true
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = ENV_CONFIG.NODE_ENV;
  
  switch (env) {
    case 'production':
      return {
        logLevel: 'error',
        enablePrettyLogs: false,
        enableStackTraces: false,
        enableUserContext: false,
        enableComponentContext: false,
        maxLogEntries: 100
      };
      
    case 'development':
      return {
        logLevel: 'debug',
        enablePrettyLogs: true,
        enableStackTraces: true,
        enableUserContext: true,
        enableComponentContext: true,
        maxLogEntries: 10000
      };
      
    case 'test':
      return {
        logLevel: 'error',
        enablePrettyLogs: false,
        enableStackTraces: false,
        enableUserContext: false,
        enableComponentContext: false,
        maxLogEntries: 50
      };
      
    default:
      return {
        logLevel: 'info',
        enablePrettyLogs: true,
        enableStackTraces: true,
        enableUserContext: true,
        enableComponentContext: true,
        maxLogEntries: 5000
      };
  }
};

// URL helpers
export const getApiUrl = (endpoint = '') => {
  return `${ENV_CONFIG.API_BASE_URL}/api${endpoint}`;
};

export const getPythonServiceUrl = (endpoint = '') => {
  return `${ENV_CONFIG.PY_SERVICE_URL}${endpoint}`;
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: ENV_CONFIG.ENABLE_ANALYTICS,
  ENABLE_DEBUG_MODE: ENV_CONFIG.ENABLE_DEBUG_MODE,
  ENABLE_PERFORMANCE_MONITORING: ENV_CONFIG.ENABLE_PERFORMANCE_MONITORING,
  ENABLE_PRETTY_LOGS: ENV_CONFIG.ENABLE_PRETTY_LOGS
};

// Component logging helpers
export const getComponentContext = (componentName, props = {}) => {
  return {
    component: componentName,
    props: Object.keys(props).length > 0 ? props : null,
    timestamp: new Date().toISOString()
  };
};

// Performance monitoring helpers
export const measurePerformance = (operation, callback) => {
  const start = performance.now();
  const result = callback();
  const duration = performance.now() - start;
  
  return {
    result,
    duration,
    operation,
    threshold: PERFORMANCE_THRESHOLDS[operation] || 1000
  };
};

// User interaction tracking
export const trackUserInteraction = (action, data = null) => {
  return {
    action,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

// State change tracking
export const trackStateChange = (componentName, stateName, oldValue, newValue) => {
  return {
    component: componentName,
    stateName,
    oldValue,
    newValue,
    timestamp: new Date().toISOString()
  };
};

export default {
  ENV_CONFIG,
  LOG_CATEGORIES,
  PERFORMANCE_THRESHOLDS,
  LOG_FORMATTING,
  getEnvironmentConfig,
  getApiUrl,
  getPythonServiceUrl,
  FEATURE_FLAGS,
  getComponentContext,
  measurePerformance,
  trackUserInteraction,
  trackStateChange
};