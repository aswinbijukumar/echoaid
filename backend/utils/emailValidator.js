import logger from './prettyLogger.js';

/**
 * Advanced email validation using Kickbox API
 * Detects fake emails, disposable emails, and invalid domains
 */
export const validateEmail = async (email) => {
  try {
    logger.info('Validating email with Kickbox', { email }, 'EMAIL_VALIDATION');
    
    // Basic email format validation first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        reason: 'Invalid email format',
        risk: 'high',
        suggestions: ['Please enter a valid email address']
      };
    }

    // Kickbox API validation using direct HTTP request
    const response = await fetch(`https://api.kickbox.com/v2/verify?email=${encodeURIComponent(email)}&apikey=${process.env.KICKBOX_API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kickbox API error: ${response.status} ${response.statusText}`);
    }

    const apiResponse = await response.json();

    logger.info('Kickbox validation response', { 
      email, 
      result: apiResponse.result,
      reason: apiResponse.reason,
      didYouMean: apiResponse.did_you_mean,
      sendex: apiResponse.sendex,
      role: apiResponse.role,
      free: apiResponse.free,
      disposable: apiResponse.disposable,
      acceptAll: apiResponse.accept_all,
      common: apiResponse.common
    }, 'EMAIL_VALIDATION');

    // Analyze Kickbox response
    const validationResult = analyzeKickboxResponse(apiResponse, email);
    
    if (validationResult.isValid) {
      logger.success('Email validation passed', { email, risk: validationResult.risk }, 'EMAIL_VALIDATION');
    } else {
      logger.warning('Email validation failed', { 
        email, 
        reason: validationResult.reason,
        risk: validationResult.risk 
      }, 'EMAIL_VALIDATION');
    }

    return validationResult;

  } catch (error) {
    logger.errorWithStack('Email validation error', error, 'EMAIL_VALIDATION');
    
    // Fallback validation if Kickbox fails
    return {
      isValid: true, // Allow signup if validation service fails
      reason: 'Validation service unavailable',
      risk: 'unknown',
      suggestions: ['Email validation service is temporarily unavailable. Please try again.']
    };
  }
};

/**
 * Analyze Kickbox response and determine email validity
 */
const analyzeKickboxResponse = (response, email) => {
  const { result, reason, did_you_mean, sendex, role, free, disposable, accept_all, common } = response;

  // High-risk indicators
  const highRiskIndicators = [
    result === 'undeliverable',
    result === 'invalid',
    disposable === true,
    role === true
    // accept_all no longer causes rejection; treat as medium risk below
  ];

  // Medium-risk indicators
  const mediumRiskIndicators = [
    result === 'risky',
    free === true,
    sendex < 0.5,
    common === false,
    accept_all === true // allow but warn
  ];

  // Check for high-risk emails
  if (highRiskIndicators.some(indicator => indicator)) {
    return {
      isValid: false,
      reason: getHighRiskReason(response),
      risk: 'high',
      suggestions: getHighRiskSuggestions(response, email)
    };
  }

  // Check for medium-risk emails
  if (mediumRiskIndicators.some(indicator => indicator)) {
    return {
      isValid: true, // Allow but warn
      reason: getMediumRiskReason(response),
      risk: 'medium',
      suggestions: getMediumRiskSuggestions(response, email)
    };
  }

  // Check for deliverable emails
  if (result === 'deliverable') {
    return {
      isValid: true,
      reason: 'Email is valid and deliverable',
      risk: 'low',
      suggestions: []
    };
  }

  // Default case - allow with warning
  return {
    isValid: true,
    reason: 'Email appears valid',
    risk: 'low',
    suggestions: []
  };
};

/**
 * Get reason for high-risk email rejection
 */
const getHighRiskReason = (response) => {
  const { result, reason, disposable, role } = response;

  if (result === 'undeliverable') {
    return 'This email address cannot receive emails';
  }
  
  if (result === 'invalid') {
    return 'This email address is invalid';
  }
  
  if (disposable) {
    return 'Disposable email addresses are not allowed';
  }
  
  if (role) {
    return 'Role-based email addresses (like admin@, info@) are not allowed';
  }

  return reason || 'Email address is not suitable for registration';
};

/**
 * Get suggestions for high-risk email rejection
 */
const getHighRiskSuggestions = (response, email) => {
  const { did_you_mean } = response;
  const suggestions = [];

  if (did_you_mean) {
    suggestions.push(`Did you mean: ${did_you_mean}?`);
  }

  suggestions.push('Please use a personal email address');
  suggestions.push('Make sure the email address is correct');
  suggestions.push('Try using Gmail, Yahoo, or Outlook');

  return suggestions;
};

/**
 * Get reason for medium-risk email warning
 */
const getMediumRiskReason = (response) => {
  const { free, sendex, accept_all } = response;

  if (free) {
    return 'Free email service detected - consider using a professional email';
  }

  if (sendex < 0.5) {
    return 'Low email deliverability score detected';
  }

  if (accept_all) {
    return 'Domain accepts all emails; proceeding with caution';
  }

  return 'Email appears valid but may have delivery issues';
};

/**
 * Get suggestions for medium-risk emails
 */
const getMediumRiskSuggestions = (response, email) => {
  const suggestions = [];

  if (response.free) {
    suggestions.push('Consider using a professional email address');
  }

  if (response.sendex < 0.5) {
    suggestions.push('This email may have delivery issues');
  }

  if (response.accept_all) {
    suggestions.push('Ensure you can receive mail at this address');
    suggestions.push('Check spam/junk folder for verification emails');
  }

  suggestions.push('Make sure you can receive emails at this address');

  return suggestions;
};

/**
 * Quick email validation for real-time frontend validation
 */
export const quickEmailValidation = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  // Check for common disposable email patterns
  const disposablePatterns = [
    /@10minutemail\./,
    /@tempmail\./,
    /@guerrillamail\./,
    /@mailinator\./,
    /@throwaway\./,
    /@temp-mail\./,
    /@yopmail\./,
    /@sharklasers\./,
    /@getnada\./,
    /@maildrop\./
  ];
  
  const isDisposable = disposablePatterns.some(pattern => pattern.test(email.toLowerCase()));
  
  if (isDisposable) {
    return { 
      isValid: false, 
      message: 'Disposable email addresses are not allowed. Please use a personal email address.' 
    };
  }
  
  return { isValid: true, message: '' };
};

export default {
  validateEmail,
  quickEmailValidation
};