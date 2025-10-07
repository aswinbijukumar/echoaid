import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get all admins (Super Admin only)
// @route   GET /api/admin/admins
// @access  Private (Super Admin)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'super_admin'] } 
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
    
    // If admin, show all regular users (active)
    if (currentUser.role === 'admin') {
      query = { role: 'user', isActive: true };
    } else if (currentUser.role === 'super_admin') {
      // Super admin sees admins and users (active)
      query = { role: { $in: ['user', 'admin'] }, isActive: true };
    } else {
      query = { _id: null }; // no access
    }
    
    const users = await User.find(query).select('-password');
    
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
      role: { $in: ['admin', 'super_admin'] }
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
      role: { $in: ['admin', 'super_admin'] }
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Prevent superadmin from demoting themselves
    if (admin._id.toString() === req.user.id && role && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }
    
    // Update admin fields
    if (role && ['admin', 'super_admin'].includes(role)) admin.role = role;
    if (typeof isActive === 'boolean') admin.isActive = isActive;
    if (assignedSections) admin.assignedSections = assignedSections;
    // Only super_admin can update permissions of admins
    if (req.user.role === 'super_admin' && permissions && typeof permissions === 'object') {
      const allowedPerms = ['manageUsers', 'manageContent', 'manageSystem', 'viewAnalytics', 'moderateForum'];
      admin.permissions = admin.permissions || {};
      for (const key of allowedPerms) {
        if (key in permissions && typeof permissions[key] === 'boolean') {
          // Never allow enabling manageSystem for non-super admins
          if (key === 'manageSystem' && admin.role !== 'super_admin') {
            admin.permissions.manageSystem = false;
          } else {
            admin.permissions[key] = permissions[key];
          }
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

// @desc    Delete admin (Super Admin only)
// @route   DELETE /api/admin/admins/:id
// @access  Private (Super Admin)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ 
      _id: req.params.id,
      role: { $in: ['admin', 'super_admin'] }
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Prevent superadmin from deleting themselves
    if (admin._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Concurrency check not needed for deleteAdmin (we only soft delete users)

    // Never allow deleting a super_admin (policy)
    if (admin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin accounts cannot be deleted'
      });
    }
    
    // If deleting an admin, reassign their managed users to the superadmin
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
      await sendEmail({
        email: admin.email,
        subject: 'Your EchoAid admin account has been deactivated',
        message: `Hello ${admin.name || ''},\n\nYour admin account has been deactivated by a super administrator. If you believe this was a mistake, please contact support.\n\nReason: account deactivated by super administrator.\n\n— EchoAid`
      });
    } catch (e) {
      console.error('Failed to send deletion email to admin:', e.message);
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
    // - super_admin: can delete users and admins, but never super_admin
    if (currentUser.role === 'admin') {
      if (user.role !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Admins can delete only their assigned users'
        });
      }
    } else if (currentUser.role === 'super_admin') {
      if (user.role === 'super_admin') {
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
      await sendEmail({
        email: user.email,
        subject: 'Your EchoAid account has been deactivated',
        message: `Hello ${user.name || ''},\n\nYour account has been deactivated by an administrator due to suspicious activity or violation of our terms. If you believe this was a mistake, please reply to this email to appeal.\n\n— EchoAid`
      });
    } catch (e) {
      console.error('Failed to send deletion email to user:', e.message);
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
      await sendEmail({
        email: admin.email,
        subject: 'Your EchoAid Admin Account Details',
        message: `Hello ${admin.name || 'Admin'},\n\nYour EchoAid admin account has been created by a Super Administrator.\n\nLogin Email: ${admin.email}\nTemporary Password: ${password}\nRole: ADMIN\nLogin URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login\n\nFor security, please sign in and change your password immediately. If you did not expect this invitation, please contact the Super Admin.\n\n— EchoAid`
      });
    } catch (e) {
      console.error('Failed to send admin welcome email:', e.message);
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
    const superAdmins = await User.countDocuments({ role: 'super_admin' });
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
        superAdmins,
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
    if (user.role === 'super_admin') {
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