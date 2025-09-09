import rateLimit from 'express-rate-limit';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiting for authentication endpoints
export const authRateLimit = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased from 5)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for OTP requests
export const otpRateLimit = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 OTP requests per minute (increased from 3)
  message: {
    success: false,
    message: 'Too many OTP requests, please try again after 1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password reset
export const passwordResetRateLimit = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 password reset requests per hour (increased from 3)
  message: {
    success: false,
    message: 'Too many password reset requests, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
export const generalRateLimit = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 