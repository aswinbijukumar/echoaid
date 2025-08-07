import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs'; // Added bcrypt import

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '2h' // Changed from 24h to 2h for better security
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

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store temporary user data in memory (in production, use Redis or similar)
    const tempUserData = {
      name,
      email,
      password: hashedPassword, // Store hashed password
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
    const message = `
Hello ${name || 'there'},

Welcome to EchoAid! Please verify your email address by entering the following OTP:

${otp}

This OTP will expire in 10 minutes.

If you didn't create an account with EchoAid, please ignore this email.

Best regards,
The EchoAid Team
    `;

    try {
      await sendEmail({
        email: email,
        subject: 'Verify your EchoAid account',
        message
      });

      console.log('OTP sent successfully:', otp); // For testing purposes

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification OTP.',
        tempUserId: tempUserId
      });
    } catch (err) {
      console.error('Send email error:', err);
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
        isEmailVerified: user.isEmailVerified
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
    const message = `
Hello ${tempUserData.name || 'there'},

Here's your new verification OTP for EchoAid:

${otp}

This OTP will expire in 10 minutes.

If you didn't request this OTP, please ignore this email.

Best regards,
The EchoAid Team
    `;

    try {
      await sendEmail({
        email: tempUserData.email,
        subject: 'Your EchoAid verification OTP',
        message
      });

      res.status(200).json({
        success: true,
        message: 'New OTP sent successfully'
      });
    } catch (err) {
      console.error('Send email error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
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

    // Update last login
    user.lastLogin = Date.now();
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
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
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
      `http://localhost:5000/api/auth/google/callback`
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Google OAuth'
    });
  }
};

// @desc    Google OAuth - Handle callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`http://localhost:3000/login?error=google_auth_failed`);
    }

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `http://localhost:5000/api/auth/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userData = await userInfoResponse.json();
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
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isEmailVerified: true,
        password: crypto.randomBytes(32).toString('hex') // Generate random password for Google users
      });
    }

    // Generate token
    const jwtToken = generateToken(user._id);

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/google/success?token=${jwtToken}`);
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
    
    res.redirect(`http://localhost:3000/login?error=${errorMessage}`);
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

    const message = `
Hello,

You are receiving this email because you (or someone else) has requested the reset of your EchoAid password.

Please click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
The EchoAid Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      console.error('Send email error:', err);
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
        avatar: user.avatar
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

// @desc    Test email configuration
// @route   POST /api/auth/test-email
// @access  Public
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const message = `
Hello,

This is a test email from EchoAid to verify that email configuration is working properly.

If you received this email, the email service is configured correctly.

Best regards,
The EchoAid Team
    `;

    await sendEmail({
      email: email,
      subject: 'EchoAid Email Test',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email. Check email configuration.'
    });
  }
}; 