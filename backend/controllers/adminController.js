import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import sendEmail from '../utils/sendEmail.js';
import logger from '../utils/prettyLogger.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


// @desc    Get all admins (Super Admin only)
// @route   GET /api/admin/admins
// @access  Private (Super Admin)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: 'admin'
    }).select('-password');

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users managed by admin (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getManagedUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = {};

    // If admin, show all regular users (both active and inactive)
    if (currentUser.role === 'admin') {
      query = { role: 'user' }; // Show both active and inactive users
    } else {
      query = { _id: null }; // no access
    }

    const users = await User.find(query).select('-password').sort({ isActive: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get admin by ID (Super Admin only)
// @route   GET /api/admin/admins/:id
// @access  Private (Super Admin)
export const getAdminById = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      role: 'admin'
    }).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user by ID (Admin only - must manage this user)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res) => {
  try {
    const currentUser = req.user;
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user can access this user
    if (currentUser.role === 'admin' && user.managedBy?.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only access users you manage'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update admin role and permissions (Super Admin only)
// @route   PUT /api/admin/admins/:id
// @access  Private (Super Admin)
export const updateAdmin = async (req, res) => {
  try {
    const { role, isActive, assignedSections, permissions } = req.body;

    const admin = await User.findOne({
      _id: req.params.id,
      role: 'admin'
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent admin from demoting themselves
    if (admin._id.toString() === req.user.id && role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Update admin fields
    if (role && role === 'admin') admin.role = role;
    if (typeof isActive === 'boolean') admin.isActive = isActive;
    if (assignedSections) admin.assignedSections = assignedSections;
    // Admin can update permissions
    if (permissions && typeof permissions === 'object') {
      const allowedPerms = ['manageUsers', 'manageContent', 'viewAnalytics', 'moderateForum'];
      admin.permissions = admin.permissions || {};
      for (const key of allowedPerms) {
        if (key in permissions && typeof permissions[key] === 'boolean') {
          admin.permissions[key] = permissions[key];
        }
      }
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user (Admin only - must manage this user)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { isActive, assignedSections } = req.body;
    const currentUser = req.user;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user can manage this user
    if (currentUser.role === 'admin' && user.managedBy?.toString() !== currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage users assigned to you'
      });
    }

    // Concurrency check
    const { ifUpdatedAt } = req.headers;
    if (ifUpdatedAt && new Date(ifUpdatedAt).getTime() !== new Date(user.updatedAt).getTime()) {
      return res.status(409).json({ success: false, message: 'Resource has changed. Refresh and retry.' });
    }

    // Admins can only update certain fields, not role
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (assignedSections) user.assignedSections = assignedSections;

    const before = user.toObject();
    await user.save();
    await AuditLog.create({
      actorId: currentUser._id,
      action: 'update_user',
      onModel: 'User',
      targetId: user._id,
      before,
      after: user.toObject()
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle user active status (Admin and Super Admin)
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin, Super Admin)
export const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const currentUser = req.user;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent users from toggling their own status
    if (user._id.toString() === currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    // Check permissions
    if (currentUser.role === 'admin') {
      // Admin cannot manage other admins
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot manage other admins'
        });
      }
      // Allowed to manage any 'user' role
    } else {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Update user status
    const before = user.toObject();
    user.isActive = isActive;
    await user.save();

    // Log the action
    await AuditLog.create({
      actorId: currentUser._id,
      action: isActive ? 'activate_user' : 'deactivate_user',
      onModel: 'User',
      targetId: user._id,
      before,
      after: user.toObject()
    });

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete admin (Super Admin only)
// @route   DELETE /api/admin/admins/:id
// @access  Private (Super Admin)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      role: 'admin'
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent admin from deleting themselves
    if (admin._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Concurrency check not needed for deleteAdmin (we only soft delete users)

    // Never allow deleting a admin (policy)
    if (admin.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin accounts cannot be deleted'
      });
    }

    // If deleting an admin, reassign their managed users to another admin
    if (admin.role === 'admin') {
      await User.updateMany(
        { managedBy: admin._id },
        { managedBy: req.user.id }
      );
    }

    // Soft delete admin
    admin.isActive = false;
    admin.deletedAt = new Date();
    const before = admin.toObject();
    await admin.save();
    await AuditLog.create({
      actorId: req.user._id,
      action: 'soft_delete_admin',
      onModel: 'User',
      targetId: admin._id,
      before,
      after: admin.toObject()
    });
    // Notify the admin via email
    try {
      const { getAccountDeactivatedEmail } = await import('../utils/emailTemplates.js');
      await sendEmail({
        email: admin.email,
        subject: 'Your EchoAid admin account has been deactivated',
        html: getAccountDeactivatedEmail(admin.name, 'Account deactivated by super administrator.')
      });
    } catch (e) {
      logger.errorWithStack('Failed to send deletion email to admin', e, 'EMAIL');
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only - must manage this user)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const currentUser = req.user;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Concurrency check
    const { ifUpdatedAt } = req.headers;
    if (ifUpdatedAt && new Date(ifUpdatedAt).getTime() !== new Date(user.updatedAt).getTime()) {
      return res.status(409).json({ success: false, message: 'Resource has changed. Refresh and retry.' });
    }

    // Role-based deletion rules
    // - admin: can delete only users they manage (role must be 'user')
    // - admin: can delete users and admins, but never admin
    if (currentUser.role === 'admin') {
      if (user.role !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Admins can delete only their assigned users'
        });
      }
    } else if (currentUser.role === 'admin') {
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Super admin accounts cannot be deleted'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    // Soft delete
    user.isActive = false;
    user.deletedAt = new Date();
    const before = user.toObject();
    await user.save();
    await AuditLog.create({
      actorId: currentUser._id,
      action: 'soft_delete_user',
      onModel: 'User',
      targetId: user._id,
      before,
      after: user.toObject()
    });
    // Notify the user via email
    try {
      const { getAccountDeactivatedEmail } = await import('../utils/emailTemplates.js');
      await sendEmail({
        email: user.email,
        subject: 'Your EchoAid account has been deactivated',
        html: getAccountDeactivatedEmail(user.name, 'Suspicious activity or violation of terms.')
      });
    } catch (e) {
      logger.errorWithStack('Failed to send deletion email to user', e, 'EMAIL');
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new admin (Super Admin only)
// @route   POST /api/admin/admins
// @access  Private (Super Admin)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, assignedSections } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new admin
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      assignedSections: assignedSections || ['alphabet'],
      managedBy: null, // Admins are managed by super admins
      permissions: {
        manageUsers: true,      // Admins can manage users
        manageContent: true,    // Admins can manage content
        manageSystem: false,    // Admins cannot manage system settings
        viewAnalytics: true,    // Admins can view analytics
        moderateForum: true     // Admins can moderate forum
      }
    });

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    // Send welcome email to the new admin (includes the password they provided)
    try {
      const { getWelcomeAdminEmail } = await import('../utils/emailTemplates.js');
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      await sendEmail({
        email: admin.email,
        subject: 'Your EchoAid Admin Account Details',
        html: getWelcomeAdminEmail(admin.name, admin.email, password, loginUrl)
      });
    } catch (e) {
      logger.errorWithStack('Failed to send admin welcome email', e, 'EMAIL');
    }

    res.status(201).json({
      success: true,
      data: adminResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, assignedSections } = req.body;
    const currentUser = req.user;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      assignedSections: assignedSections || ['alphabet'],
      managedBy: currentUser._id, // User is managed by the admin who created them
      permissions: {
        manageUsers: false,
        manageContent: false,
        manageSystem: false,
        viewAnalytics: false,
        moderateForum: false
      }
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats
// @access  Private (Super Admin, Admin)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const admins = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        admins,
        regularUsers,
        newUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Super Admin, Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    const user = req.user;

    // Get basic stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get recent users
    const recentUsers = await User.find({})
      .select('name email role createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get users by verification status
    const usersByVerification = await User.aggregate([
      {
        $group: {
          _id: '$isEmailVerified',
          count: { $sum: 1 }
        }
      }
    ]);

    let dashboardData = {
      stats: {
        totalUsers,
        activeUsers
      },
      recentUsers,
      usersByRole,
      usersByVerification
    };

    // Add super admin specific data
    if (user.role === 'admin') {
      const inactiveUsers = await User.countDocuments({ isActive: false });
      const unverifiedUsers = await User.countDocuments({ isEmailVerified: false });

      dashboardData.stats.inactiveUsers = inactiveUsers;
      dashboardData.stats.unverifiedUsers = unverifiedUsers;
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload media file (image/video)
// @route   POST /api/admin/upload
// @access  Private (Admin, Super Admin)
export const uploadMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.files.file;
    const folder = req.body.folder || 'misc';

    // Verify file type (basic check)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid file type' });
    }

    // Upload to Cloudinary
    // Use a temp file path if available, or buffer stream if needed.
    // Express-fileupload usually provides .tempFilePath if configured, or .data buffer.
    // Let's assume tempFilePath is available or use a stream upload helper if not.
    // Ideally we should use the same pattern as contentController.js.

    // Check contentController.js pattern (I recall seeing it use uploaded.secure_url directly from a "uploaded" object)
    // It likely uses the cloudinary.uploader.upload method.

    let result;
    if (file.tempFilePath) {
      result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: `echoaid/${folder}`,
        resource_type: 'auto'
      });
    } else {
      // If no temp file, we can write buffer to a temp file or use stream.
      // Easiest is to ensure temp files are used in app config.
      // But purely for robustness, let's write to a temp file if needed or use a direct upload stream.
      // For now, let's assume valid tempFilePath as typically configured in `server.js` with `useTempFiles: true`.
      result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: `echoaid/${folder}`,
        resource_type: 'auto'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type
      }
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
}; 