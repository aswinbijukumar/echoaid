import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // Human-friendly unique identifier for admin UI
  userCode: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
    trim: true
  },
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
  deletedAt: {
    type: Date,
    default: null
  },
  assignedSections: [{
    type: String
  }],
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // New: multi-admin access list
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  signProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  learningStats: {
    streak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalXP: {
      type: Number,
      default: 0
    },
    weeklyXP: {
      type: Number,
      default: 0
    },
    monthlyXP: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    xpToNextLevel: {
      type: Number,
      default: 100
    },
    signsLearned: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    },
    lastPracticeDate: {
      type: Date,
      default: null
    },
    // Quiz-specific stats
    quizzesCompleted: {
      type: Number,
      default: 0
    },
    perfectQuizzes: {
      type: Number,
      default: 0
    },
    averageQuizScore: {
      type: Number,
      default: 0
    },
    categoryProgress: {
      alphabet: { type: Number, default: 0 },
      phrases: { type: Number, default: 0 },
      family: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      advanced: { type: Number, default: 0 }
    },
    // Gamification features
    badges: [{
      type: String
    }],
    achievements: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAchievement'
    }],
    dailyGoal: {
      type: Number,
      default: 100
    },
    weeklyGoal: {
      type: Number,
      default: 500
    },
    monthlyGoal: {
      type: Number,
      default: 2000
    },
    // Performance tracking
    recentQuizzes: [{
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      score: { type: Number },
      completedAt: { type: Date },
      category: { type: String }
    }],
    weakAreas: [{
      type: String
    }],
    strongAreas: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

// Ensure a unique, readable userCode exists
userSchema.pre('save', async function(next) {
  if (this.userCode) return next();
  try {
    // Example: EA-<8 base36 chars>
    let attempts = 0;
    while (attempts < 5) {
      const rand = crypto.randomBytes(6).toString('hex');
      const candidate = `EA-${parseInt(rand, 16).toString(36).toUpperCase().slice(0, 8)}`;
      const exists = await this.constructor.findOne({ userCode: candidate }).lean();
      if (!exists) {
        this.userCode = candidate;
        break;
      }
      attempts += 1;
    }
    if (!this.userCode) {
      this.userCode = `EA-${Date.now().toString(36).toUpperCase()}`;
    }
    next();
  } catch (e) {
    next(e);
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  // Skip hashing if password is already hashed (starts with $2a$ or $2b$)
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    next();
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
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
          manageUsers: true,      // Can manage admins
          manageContent: true,    // Can manage all content
          manageSystem: true,     // Can manage system settings
          viewAnalytics: true,    // Can view all analytics
          moderateForum: true     // Can moderate forum
        };
        this.managedBy = null; // Super admins are not managed by anyone
        break;
      case 'admin':
        this.permissions = {
          manageUsers: true,      // Can manage users assigned to them
          manageContent: true,    // Can manage content in their sections
          manageSystem: false,    // Cannot manage system settings
          viewAnalytics: true,    // Can view analytics for their users
          moderateForum: true     // Can moderate forum
        };
        this.managedBy = null; // Admins are managed by super admins (set explicitly)
        break;
      case 'user':
        this.permissions = {
          manageUsers: false,     // Cannot manage other users
          manageContent: false,   // Cannot manage content
          manageSystem: false,    // Cannot manage system
          viewAnalytics: false,   // Cannot view analytics
          moderateForum: false    // Cannot moderate forum
        };
        // managedBy will be set when user is created by an admin
        break;
    }
  }
  next();
});

export default mongoose.model('User', userSchema); 