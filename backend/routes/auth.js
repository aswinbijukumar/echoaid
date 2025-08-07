import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendOTP,
  testEmail,
  googleAuthInitiate,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { 
  authRateLimit, 
  otpRateLimit, 
  passwordResetRateLimit 
} from '../middleware/rateLimit.js';
import {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateOTP,
  validateForgotPassword,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Public routes with rate limiting and validation
router.post('/register', authRateLimit, validateRegistration, handleValidationErrors, register);
router.post('/login', authRateLimit, validateLogin, handleValidationErrors, login);
router.post('/verify-email', otpRateLimit, validateOTP, handleValidationErrors, verifyEmail);
router.post('/resend-otp', otpRateLimit, resendOTP);
router.post('/test-email', testEmail);
router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);
router.post('/forgotpassword', passwordResetRateLimit, validateForgotPassword, handleValidationErrors, forgotPassword);
router.put('/resetpassword/:resettoken', passwordResetRateLimit, validatePasswordReset, handleValidationErrors, resetPassword);

// Protected routes
router.get('/me', protect, getMe);

export default router; 