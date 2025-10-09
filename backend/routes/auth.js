import express from 'express';
import { 
  register,
  login,
  verifyEmail,
  resendOTP,
  googleAuthInitiate,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfilePhoto,
  removeProfilePhoto,
  generate2FASecret,
  enable2FA,
  disable2FA,
  verify2FALogin,
  updatePrivacy,
  updateNotifications
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

router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);
router.post('/forgotpassword', passwordResetRateLimit, validateForgotPassword, handleValidationErrors, forgotPassword);
router.put('/resetpassword/:resettoken', passwordResetRateLimit, validatePasswordReset, handleValidationErrors, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/2fa/setup', protect, generate2FASecret);
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/verify-login', verify2FALogin);

// Profile photo management
router.put('/profile-photo', protect, updateProfilePhoto);
router.delete('/profile-photo', protect, removeProfilePhoto);

// Privacy settings
router.put('/privacy', protect, updatePrivacy);
// Notification preferences
router.put('/notifications', protect, updateNotifications);

export default router; 