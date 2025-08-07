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
  removeProfilePhoto
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

// Profile photo management
router.put('/profile-photo', protect, updateProfilePhoto);
router.delete('/profile-photo', protect, removeProfilePhoto);

export default router; 