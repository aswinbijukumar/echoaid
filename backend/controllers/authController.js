import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs'; // Added bcrypt import
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import sessionSecurity from '../utils/sessionSecurity.js';
import logger from '../utils/prettyLogger.js';
import UserSession from '../models/UserSession.js';

import { ENV_CONFIG } from '../config/prettyConfig.js';

import { calculateLevel, calculateXPToNextLevel } from '../utils/gamificationUtils.js';
const FRONTEND_URL = ENV_CONFIG.FRONTEND_URL;

const BACKEND_URL = ENV_CONFIG.BACKEND_URL;

const generateToken = (id) => {
  return jwt.sign({ id }, ENV_CONFIG.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, ENV_CONFIG.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Store temporary user data in memory (in production, use Redis or similar)
    const tempUserData = {
      name,
      email,
      password: password, // Store plain password, will be hashed by model
      otp: hashedOTP,
      expireAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // For now, we'll store in a simple object. In production, use Redis
    if (!global.tempUsers) {
      global.tempUsers = new Map();
    }

    const tempUserId = crypto.randomBytes(16).toString('hex');
    global.tempUsers.set(tempUserId, tempUserData);

    // Send verification email
    try {
      const { getVerificationEmail } = await import('../utils/emailTemplates.js');
      await sendEmail({
        email: email,
        subject: 'Verify your EchoAid account',
        html: getVerificationEmail(name, otp)
      });



      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification OTP.',
        tempUserId: tempUserId
      });
    } catch (err) {
      logger.errorWithStack('Send email error', err, 'EMAIL');
      // Clean up temp data if email fails
      global.tempUsers.delete(tempUserId);

      return res.status(500).json({
        success: false,
        message: 'Registration failed. Please check your email configuration.'
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { tempUserId, otp } = req.body;

    if (!tempUserId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide temp user ID and OTP'
      });
    }

    // Get temporary user data
    if (!global.tempUsers || !global.tempUsers.has(tempUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification session'
      });
    }

    const tempUserData = global.tempUsers.get(tempUserId);

    // Check if OTP is expired
    if (tempUserData.expireAt < Date.now()) {
      global.tempUsers.delete(tempUserId);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please register again.'
      });
    }

    // Hash the provided OTP
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Check if OTP matches
    if (tempUserData.otp !== hashedOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if email already exists in database
    const existingUser = await User.findOne({ email: tempUserData.email });
    if (existingUser) {
      global.tempUsers.delete(tempUserId);
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create the actual user account
    const user = await User.create({
      name: tempUserData.name,
      email: tempUserData.email,
      password: tempUserData.password, // Already hashed
      isEmailVerified: true
    });

    // Clean up temporary data
    global.tempUsers.delete(tempUserId);

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { tempUserId } = req.body;

    if (!tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide temp user ID'
      });
    }

    // Get temporary user data
    if (!global.tempUsers || !global.tempUsers.has(tempUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification session'
      });
    }

    const tempUserData = global.tempUsers.get(tempUserId);

    // Check if OTP is expired
    if (tempUserData.expireAt < Date.now()) {
      global.tempUsers.delete(tempUserId);
      return res.status(400).json({
        success: false,
        message: 'Verification session expired. Please register again.'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Update temporary user data with new OTP
    tempUserData.otp = hashedOTP;
    tempUserData.expireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    global.tempUsers.set(tempUserId, tempUserData);

    // Send verification email
    try {
      const { getVerificationEmail } = await import('../utils/emailTemplates.js');
      await sendEmail({
        email: tempUserData.email,
        subject: 'Your EchoAid verification OTP',
        html: getVerificationEmail(tempUserData.name, otp)
      });

      res.status(200).json({
        success: true,
        message: 'New OTP sent successfully'
      });
    } catch (err) {
      logger.errorWithStack('Send email error', err, 'EMAIL');
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
  } catch (error) {
    logger.errorWithStack('Resend OTP error', error, 'AUTH');
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If 2FA is enabled, respond with a challenge instead of issuing JWT
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        message: 'Two-factor authentication required'
      });
    }

    // Update daily login streak BEFORE changing lastLogin
    try {
      // Compute daily login streak based on previous lastLogin
      const prev = user.lastLogin ? new Date(user.lastLogin) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (!user.learningStats) user.learningStats = {};

      if (!prev) {
        user.learningStats.streak = Math.max(1, user.learningStats.streak || 0);
      } else {
        const prevDay = new Date(prev);
        prevDay.setHours(0, 0, 0, 0);
        if (prevDay.getTime() === today.getTime()) {
          // Already logged in today: keep streak
        } else if (prevDay.getTime() === yesterday.getTime()) {
          user.learningStats.streak = (user.learningStats.streak || 0) + 1;
        } else {
          user.learningStats.streak = 1;
        }
      }
      user.learningStats.longestStreak = Math.max(user.learningStats.longestStreak || 0, user.learningStats.streak || 0);
    } catch (e) {
      console.warn('Daily streak update skipped:', e?.message);
    }

    // Update last login and issue token
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);

    // Create secure session
    const session = await sessionSecurity.createSession(user._id, req);

    res.status(200).json({
      success: true,
      token,
      refreshToken: session.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        permissions: user.permissions,
        subscription: user.subscription || {
          plan: 'free',
          status: 'trial',
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          features: {}
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Google OAuth - Initiate OAuth flow
// @route   GET /api/auth/google
// @access  Public
export const googleAuthInitiate = async (req, res) => {
  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${BACKEND_URL}/api/auth/google/callback`
    );

    // Safe debug: confirm the client and redirect URI (do not log secret)
    console.log('[Google OAuth] Initiate using clientId:', process.env.GOOGLE_CLIENT_ID);
    console.log('[Google OAuth] Redirect URI:', `${BACKEND_URL}/api/auth/google/callback`);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      redirect_uri: `${BACKEND_URL}/api/auth/google/callback`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiate error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// @desc    Google OAuth - Handle callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${BACKEND_URL}/api/auth/google/callback`
    );

    // Safe debug: confirm envs match configured credentials
    console.log('[Google OAuth] Callback using clientId:', process.env.GOOGLE_CLIENT_ID);
    console.log('[Google OAuth] Redirect URI:', `${BACKEND_URL}/api/auth/google/callback`);

    // Exchange code for tokens (explicitly pass redirect_uri for reliability)
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: `${BACKEND_URL}/api/auth/google/callback`
    });
    oauth2Client.setCredentials(tokens);

    // Ensure we have an access token; try to refresh if missing
    let accessToken = tokens?.access_token;
    if (!accessToken) {
      const at = await oauth2Client.getAccessToken();
      accessToken = typeof at === 'string' ? at : at?.token;
    }
    if (!accessToken) {
      throw new Error('Failed to obtain Google access token');
    }

    // Get user info using Google API client (avoids relying on global fetch)
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    let userData;
    try {
      const { data } = await oauth2.userinfo.get();
      userData = data;
    } catch (e) {
      // Fallback to direct fetch with explicit Authorization header
      const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!resp.ok) {
        throw e;
      }
      userData = await resp.json();
    }
    const { email, name, picture, id: googleId } = userData;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update user if they exist
      user.googleId = googleId;
      user.avatar = picture;
      user.lastLogin = Date.now();
      await user.save();
    } else {
      // Create new user
      // Generate a compliant password (uppercase, lowercase, number, special char)
      const randomPassword = crypto.randomBytes(16).toString('hex') + 'A1!';

      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isEmailVerified: true,
        password: randomPassword
      });
    }

    // Generate token
    const jwtToken = generateToken(user._id);

    // Create session to get refresh token
    const session = await sessionSecurity.createSession(user._id, req);

    // Redirect to frontend with token and refresh token
    res.redirect(`${FRONTEND_URL}/auth/google/success?token=${jwtToken}&refreshToken=${session.refreshToken}&notice=login_success`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);

    // Provide more specific error messages
    let errorMessage = 'google_auth_failed';
    if (error.message.includes('invalid_client')) {
      errorMessage = 'google_config_error';
    } else if (error.message.includes('access_denied')) {
      errorMessage = 'google_access_denied';
    } else if (error.message.includes('network')) {
      errorMessage = 'google_network_error';
    }

    res.redirect(`${FRONTEND_URL}/login?error=${errorMessage}`);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      const { getResetPasswordEmail } = await import('../utils/emailTemplates.js');
      await sendEmail({
        email: user.email,
        subject: 'Reset Your Password - EchoAid',
        html: getResetPasswordEmail(user.name, resetUrl)
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      logger.errorWithStack('Send email error', err, 'EMAIL');
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 2FA: Generate secret and QR provisioning URI
export const generate2FASecret = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const secret = speakeasy.generateSecret({ length: 20, name: `EchoAid (${user.email})` });
    const otpauth_url = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpauth_url);

    // Store temp secret in memory keyed by user for confirm step
    if (!global.temp2FA) global.temp2FA = new Map();
    global.temp2FA.set(user._id.toString(), { secret: secret.base32, createdAt: Date.now() });

    res.json({ success: true, data: { base32: secret.base32, otpauth_url, qrDataUrl } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// 2FA: Enable by verifying code
export const enable2FA = async (req, res) => {
  try {
    const { token } = req.body; // 6-digit from authenticator
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!global.temp2FA || !global.temp2FA.has(user._id.toString())) {
      return res.status(400).json({ success: false, message: '2FA setup not initiated' });
    }
    const { secret } = global.temp2FA.get(user._id.toString());
    const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid code' });

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    await user.save();
    global.temp2FA.delete(user._id.toString());
    res.json({ success: true, message: 'Two-factor authentication enabled' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// 2FA: Disable
export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    await user.save();
    res.json({ success: true, message: 'Two-factor authentication disabled' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// 2FA: Verify login code and issue JWT
export const verify2FALogin = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Email and token are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA is not enabled for this account' });
    }
    const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 });
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    user.lastLogin = Date.now();
    await user.save();
    const jwtToken = generateToken(user._id);

    // Create secure session
    const session = await sessionSecurity.createSession(user._id, req);

    return res.status(200).json({
      success: true,
      token: jwtToken,
      refreshToken: session.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        permissions: user.permissions,
        twoFactorEnabled: user.twoFactorEnabled,
        privacy: user.privacy || { profilePublic: false, showAchievements: true, dataSharing: false },
        notifications: user.notifications || { emailNotifications: true, practiceReminders: true, pushNotifications: false },
        // Expose learning stats so frontend gamification can refresh UI
        learningStats: {
          streak: user.learningStats?.streak || 0,
          longestStreak: user.learningStats?.longestStreak || 0,
          totalXP: user.learningStats?.totalXP || 0,
          level: user.learningStats?.level || 1,
          xpToNextLevel: user.learningStats?.xpToNextLevel ?? calculateXPToNextLevel(user.learningStats?.totalXP || 0),
          QuizesCompleted: user.learningStats?.QuizesCompleted || 0,
          perfectQuizes: user.learningStats?.perfectQuizes || 0,
          averageQuizScore: user.learningStats?.averageQuizScore || 0,
          streakFreeze: user.learningStats?.streakFreeze || 0,
          dailyGoal: user.learningStats?.dailyGoal || 100,
          weeklyXP: user.learningStats?.weeklyXP || 0,
          monthlyXP: user.learningStats?.monthlyXP || 0,
          badges: user.learningStats?.badges || [],
          achievements: user.learningStats?.achievements || [],
          categoryProgress: user.learningStats?.categoryProgress || {},
        },
        // Include subscription data
        subscription: user.subscription || {
          plan: 'free',
          status: 'trial',
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          features: {}
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// @desc    Update profile photo
// @route   PUT /api/auth/profile-photo
// @access  Private
export const updateProfilePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const userId = req.user.id;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a photo URL'
      });
    }

    // Validate URL format (allow both http/https URLs and data URLs)
    if (!photoUrl.startsWith('data:image/') && !photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid photo URL or data URL'
      });
    }

    // Update user's avatar
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: photoUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/auth/profile-photo
// @access  Private
export const removeProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user's avatar to empty string
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: '' },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      data: {
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Remove profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/auth/privacy
// @access  Private
export const updatePrivacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profilePublic, showAchievements, dataSharing } = req.body || {};
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.privacy = {
      profilePublic: typeof profilePublic === 'boolean' ? profilePublic : (user.privacy?.profilePublic ?? false),
      showAchievements: typeof showAchievements === 'boolean' ? showAchievements : (user.privacy?.showAchievements ?? true),
      dataSharing: typeof dataSharing === 'boolean' ? dataSharing : (user.privacy?.dataSharing ?? false)
    };
    await user.save();

    res.status(200).json({ success: true, data: user.privacy });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/auth/notifications
// @access  Private
export const updateNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailNotifications, practiceReminders, pushNotifications } = req.body || {};
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.notifications = {
      emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : (user.notifications?.emailNotifications ?? true),
      practiceReminders: typeof practiceReminders === 'boolean' ? practiceReminders : (user.notifications?.practiceReminders ?? true),
      pushNotifications: typeof pushNotifications === 'boolean' ? pushNotifications : (user.notifications?.pushNotifications ?? false)
    };
    await user.save();

    res.status(200).json({ success: true, data: user.notifications });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error', error: e.message });
  }
};

// @desc    Refresh token with enhanced security
// @route   POST /api/auth/refresh
// @access  Private
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Validate refresh token
    const session = await sessionSecurity.validateRefreshToken(refreshToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const user = session.userId;

    if (!user.isActive) {
      await sessionSecurity.revokeSession(refreshToken);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check for suspicious activity
    const suspiciousCheck = await sessionSecurity.checkSuspiciousActivity(user._id, req);
    if (suspiciousCheck.suspicious) {
      console.warn(`Suspicious activity detected for user ${user.email}:`, suspiciousCheck.reason);
      // For high severity, revoke all sessions
      if (suspiciousCheck.severity === 'high') {
        await sessionSecurity.revokeAllUserSessions(user._id);
        return res.status(401).json({
          success: false,
          message: 'Suspicious activity detected. Please log in again.'
        });
      }
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: refreshToken, // Keep same refresh token
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// @desc    Logout user and revoke session
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await sessionSecurity.revokeSession(refreshToken);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Get user active sessions
// @route   GET /api/auth/sessions
// @access  Private
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await sessionSecurity.getUserSessions(req.user._id);

    res.status(200).json({
      success: true,
      data: sessions.map(session => ({
        id: session._id,
        deviceInfo: session.deviceInfo,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }))
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions'
    });
  }
};

// @desc    Revoke specific session
// @route   DELETE /api/auth/sessions/:sessionId
// @access  Private
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await UserSession.findOneAndUpdate(
      { _id: sessionId, userId: req.user._id },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session'
    });
  }
};

// @desc    Revoke all sessions
// @route   DELETE /api/auth/sessions
// @access  Private
export const revokeAllSessions = async (req, res) => {
  try {
    await sessionSecurity.revokeAllUserSessions(req.user._id);

    res.status(200).json({
      success: true,
      message: 'All sessions revoked successfully'
    });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions'
    });
  }
};
