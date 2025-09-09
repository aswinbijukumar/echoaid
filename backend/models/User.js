import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Only required if not using Google OAuth
    },
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(password) {
        // Skip validation if password is already hashed (starts with $2a$ or $2b$)
        if (password.startsWith('$2a$') || password.startsWith('$2b$')) {
          return true;
        }
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
      },
      message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
    },
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  permissions: {
    manageUsers: {
      type: Boolean,
      default: false
    },
    manageContent: {
      type: Boolean,
      default: false
    },
    manageSystem: {
      type: Boolean,
      default: false
    },
    viewAnalytics: {
      type: Boolean,
      default: false
    },
    moderateForum: {
      type: Boolean,
      default: false
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: true // All users in database are verified
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  refreshToken: String,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedSections: [{
    type: String
  }]
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (1 hour instead of 10 minutes)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken;
};

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = {
          manageUsers: true,
          manageContent: true,
          manageSystem: true,
          viewAnalytics: true,
          moderateForum: true
        };
        break;
      case 'admin':
        this.permissions = {
          manageUsers: false,
          manageContent: true,
          manageSystem: false,
          viewAnalytics: true,
          moderateForum: true
        };
        break;
      case 'user':
        this.permissions = {
          manageUsers: false,
          manageContent: false,
          manageSystem: false,
          viewAnalytics: false,
          moderateForum: false
        };
        break;
    }
  }
  next();
});

export default mongoose.model('User', userSchema); 