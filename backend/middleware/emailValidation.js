import { validateEmail, quickEmailValidation } from '../utils/emailValidator.js';
import logger from '../utils/prettyLogger.js';

/**
 * Middleware for email validation during signup
 * Uses Kickbox API to detect fake emails
 */
export const validateEmailMiddleware = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        field: 'email'
      });
    }

    // Quick validation first (client-side compatible)
    const quickValidation = quickEmailValidation(email);
    if (!quickValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: quickValidation.message,
        field: 'email',
        validationType: 'quick'
      });
    }

    // Advanced validation with Kickbox
    logger.info('Starting email validation', { email }, 'EMAIL_VALIDATION');
    const validationResult = await validateEmail(email);

    if (!validationResult.isValid) {
      logger.warning('Email validation failed', { 
        email, 
        reason: validationResult.reason,
        risk: validationResult.risk 
      }, 'EMAIL_VALIDATION');

      return res.status(400).json({
        success: false,
        message: validationResult.reason,
        field: 'email',
        validationType: 'advanced',
        risk: validationResult.risk,
        suggestions: validationResult.suggestions
      });
    }

    // Log successful validation
    if (validationResult.risk === 'medium') {
      logger.warning('Medium-risk email detected', { 
        email, 
        reason: validationResult.reason 
      }, 'EMAIL_VALIDATION');
    } else {
      logger.success('Email validation passed', { 
        email, 
        risk: validationResult.risk 
      }, 'EMAIL_VALIDATION');
    }

    // Add validation info to request for logging
    req.emailValidation = {
      risk: validationResult.risk,
      reason: validationResult.reason,
      validated: true
    };

    next();

  } catch (error) {
    logger.errorWithStack('Email validation middleware error', error, 'EMAIL_VALIDATION');
    
    // Allow signup if validation service fails (fail-open approach)
    logger.warning('Email validation service unavailable, allowing signup', { email }, 'EMAIL_VALIDATION');
    next();
  }
};

/**
 * Lightweight email validation for other endpoints
 * Does not use Kickbox API (for performance)
 */
export const basicEmailValidation = (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        field: 'email'
      });
    }

    const validation = quickEmailValidation(email);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        field: 'email'
      });
    }

    next();

  } catch (error) {
    logger.errorWithStack('Basic email validation error', error, 'EMAIL_VALIDATION');
    next();
  }
};

export default {
  validateEmailMiddleware,
  basicEmailValidation
};
