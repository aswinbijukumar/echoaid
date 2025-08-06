import express from 'express';
import {
  register,
  login,
  googleAuthInitiate,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);

export default router; 