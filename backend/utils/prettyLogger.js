/**
 * Pretty Logger - Glass Theme Console Output
 * Provides beautiful, organized console logging with glass theme styling
 */

// Glass theme colors and styles
const THEME = {
  // Background colors
  bg: {
    primary: 'background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    secondary: 'background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
    success: 'background: linear-gradient(135deg, #00cc00 0%, #00aa00 100%)',
    warning: 'background: linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)',
    error: 'background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
    info: 'background: linear-gradient(135deg, #4488ff 0%, #2266cc 100%)',
    glass: 'background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1)'
  },
  
  // Text colors
  text: {
    primary: 'color: #ffffff',
    secondary: 'color: #cccccc',
    success: 'color: #00ff00',
    warning: 'color: #ffaa00',
    error: 'color: #ff6666',
    info: 'color: #66aaff',
    accent: 'color: #ffdd44'
  },
  
  // Border styles
  border: {
    glass: 'border: 1px solid rgba(255, 255, 255, 0.2)',
    success: 'border: 1px solid rgba(0, 255, 0, 0.3)',
    warning: 'border: 1px solid rgba(255, 170, 0, 0.3)',
    error: 'border: 1px solid rgba(255, 102, 102, 0.3)',
    info: 'border: 1px solid rgba(102, 170, 255, 0.3)'
  }
};

// Log levels with styling
const LOG_LEVELS = {
  SUCCESS: {
    icon: '✅',
    style: `${THEME.bg.success}; ${THEME.text.primary}; ${THEME.border.success}; padding: 8px 16px; border-radius: 8px; font-weight: bold;`,
    title: 'SUCCESS'
  },
  ERROR: {
    icon: '❌',
    style: `${THEME.bg.error}; ${THEME.text.primary}; ${THEME.border.error}; padding: 8px 16px; border-radius: 8px; font-weight: bold;`,
    title: 'ERROR'
  },
  WARNING: {
    icon: '⚠️',
    style: `${THEME.bg.warning}; ${THEME.text.primary}; ${THEME.border.warning}; padding: 8px 16px; border-radius: 8px; font-weight: bold;`,
    title: 'WARNING'
  },
  INFO: {
    icon: 'ℹ️',
    style: `${THEME.bg.info}; ${THEME.text.primary}; ${THEME.border.info}; padding: 8px 16px; border-radius: 8px; font-weight: bold;`,
    title: 'INFO'
  },
  DEBUG: {
    icon: '🔍',
    style: `${THEME.bg.glass}; ${THEME.text.secondary}; ${THEME.border.glass}; padding: 6px 12px; border-radius: 6px; font-size: 12px;`,
    title: 'DEBUG'
  },
  API: {
    icon: '🌐',
    style: `${THEME.bg.secondary}; ${THEME.text.accent}; ${THEME.border.glass}; padding: 6px 12px; border-radius: 6px; font-family: monospace;`,
    title: 'API'
  },
  DATABASE: {
    icon: '🗄️',
    style: `${THEME.bg.primary}; ${THEME.text.info}; ${THEME.border.glass}; padding: 6px 12px; border-radius: 6px; font-family: monospace;`,
    title: 'DATABASE'
  },
  AUTH: {
    icon: '🔐',
    style: `${THEME.bg.primary}; ${THEME.text.success}; ${THEME.border.glass}; padding: 6px 12px; border-radius: 6px; font-family: monospace;`,
    title: 'AUTH'
  },
  GAMIFICATION: {
    icon: '🎮',
    style: `${THEME.bg.primary}; ${THEME.text.accent}; ${THEME.border.glass}; padding: 6px 12px; border-radius: 6px; font-family: monospace;`,
    title: 'GAMIFICATION'
  },
  RECOGNITION: {
    icon: '👁️',
    style: `${THEME.bg.primary}; ${THEME.text.info}; ${THEME.border.glass}; padding: 6px 12px; border-radius: 6px; font-family: monospace;`,
    title: 'RECOGNITION'
  }
};

class PrettyLogger {
  constructor() {
    this.isEnabled = process.env.NODE_ENV !== 'production';
    this.timestamp = () => new Date().toISOString();
  }

  // Main logging method
  log(level, message, data = null, context = '') {
    if (!this.isEnabled) return;

    const levelConfig = LOG_LEVELS[level] || LOG_LEVELS.INFO;
    const timestamp = this.timestamp();
    const contextStr = context ? `[${context}]` : '';
    
    // Main log message
    console.log(
      `%c${levelConfig.icon} ${levelConfig.title} ${contextStr} ${timestamp}`,
      levelConfig.style,
      message
    );

    // Additional data if provided
    if (data) {
      console.log(
        `%c📊 Data:`,
        `${THEME.bg.glass}; ${THEME.text.secondary}; padding: 4px 8px; border-radius: 4px; font-size: 11px;`,
        data
      );
    }
  }

  // Convenience methods
  success(message, data = null, context = '') {
    this.log('SUCCESS', message, data, context);
  }

  error(message, data = null, context = '') {
    this.log('ERROR', message, data, context);
  }

  warning(message, data = null, context = '') {
    this.log('WARNING', message, data, context);
  }

  info(message, data = null, context = '') {
    this.log('INFO', message, data, context);
  }

  debug(message, data = null, context = '') {
    this.log('DEBUG', message, data, context);
  }

  // Specialized logging methods
  api(method, url, status, responseTime = null, context = '') {
    const message = `${method} ${url} ${status}`;
    const data = responseTime ? { responseTime: `${responseTime}ms` } : null;
    this.log('API', message, data, context);
  }

  database(operation, collection, result = null, context = '') {
    const message = `${operation} ${collection}`;
    this.log('DATABASE', message, result, context);
  }

  auth(action, user = null, context = '') {
    const message = `${action}${user ? ` for ${user}` : ''}`;
    this.log('AUTH', message, null, context);
  }

  gamification(action, data = null, context = '') {
    this.log('GAMIFICATION', action, data, context);
  }

  recognition(action, data = null, context = '') {
    this.log('RECOGNITION', action, data, context);
  }

  // Server startup banner
  startup(port, environment, services = []) {
    console.log(
      `%c🚀 EchoAid Server Started`,
      `${THEME.bg.success}; ${THEME.text.primary}; padding: 12px 24px; border-radius: 12px; font-size: 18px; font-weight: bold; text-align: center;`
    );
    
    console.log(
      `%c📍 Port: ${port}`,
      `${THEME.bg.glass}; ${THEME.text.accent}; padding: 6px 12px; border-radius: 6px; margin: 4px 0;`
    );
    
    console.log(
      `%c🌍 Environment: ${environment}`,
      `${THEME.bg.glass}; ${THEME.text.info}; padding: 6px 12px; border-radius: 6px; margin: 4px 0;`
    );

    if (services.length > 0) {
      console.log(
        `%c🔧 Services:`,
        `${THEME.bg.glass}; ${THEME.text.secondary}; padding: 6px 12px; border-radius: 6px; margin: 4px 0;`
      );
      services.forEach(service => {
        console.log(
          `%c  ✅ ${service}`,
          `${THEME.bg.success}; ${THEME.text.primary}; padding: 4px 8px; border-radius: 4px; margin: 2px 0; font-size: 12px;`
        );
      });
    }
  }

  // Request logging
  request(method, url, status, responseTime, userAgent = '') {
    const statusColor = status >= 200 && status < 300 ? 'success' : 
                       status >= 400 ? 'error' : 'warning';
    
    console.log(
      `%c${method} ${url} ${status} ${responseTime}ms`,
      `${THEME.bg[statusColor]}; ${THEME.text.primary}; padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 12px;`
    );
    
    if (userAgent) {
      console.log(
        `%cUser-Agent: ${userAgent}`,
        `${THEME.bg.glass}; ${THEME.text.secondary}; padding: 4px 8px; border-radius: 4px; font-size: 10px;`
      );
    }
  }

  // Error with stack trace
  errorWithStack(message, error, context = '') {
    this.error(message, null, context);
    if (error && error.stack) {
      console.log(
        `%c📚 Stack Trace:`,
        `${THEME.bg.error}; ${THEME.text.primary}; padding: 4px 8px; border-radius: 4px; font-size: 11px;`
      );
      console.log(
        `%c${error.stack}`,
        `${THEME.bg.glass}; ${THEME.text.secondary}; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 10px; white-space: pre-wrap;`
      );
    }
  }

  // Performance logging
  performance(operation, duration, threshold = 1000) {
    const level = duration > threshold ? 'WARNING' : 'INFO';
    const message = `${operation} completed in ${duration}ms`;
    const data = { duration, threshold, status: duration > threshold ? 'slow' : 'fast' };
    this.log(level, message, data, 'PERFORMANCE');
  }

  // Security logging
  security(event, details = null, context = '') {
    console.log(
      `%c🔒 SECURITY ${context} ${this.timestamp()}`,
      `${THEME.bg.error}; ${THEME.text.primary}; ${THEME.border.error}; padding: 8px 16px; border-radius: 8px; font-weight: bold;`,
      event
    );
    
    if (details) {
      console.log(
        `%c🔍 Details:`,
        `${THEME.bg.glass}; ${THEME.text.secondary}; padding: 4px 8px; border-radius: 4px; font-size: 11px;`,
        details
      );
    }
  }
}

// Create singleton instance
const logger = new PrettyLogger();

export default logger;