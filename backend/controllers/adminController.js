import User from '../models/User.js';

// @desc    Get all users (Super Admin only)
// @route   GET /api/admin/users
// @access  Private (Super Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
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

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Super Admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

// @desc    Update user role and permissions (Super Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (Super Admin)
export const updateUser = async (req, res) => {
  try {
    const { role, isActive, assignedSections } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (assignedSections) user.assignedSections = assignedSections;
    
    await user.save();
    
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

// @desc    Delete user (Super Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
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

// @desc    Create new user (Super Admin only)
// @route   POST /api/admin/users
// @access  Private (Super Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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
      role: role || 'user',
      isEmailVerified: true,
      isActive: true,
      permissions: {
        manageUsers: role === 'super_admin',
        manageContent: role === 'admin' || role === 'super_admin',
        manageSystem: role === 'super_admin',
        viewAnalytics: role === 'admin' || role === 'super_admin',
        moderateForum: role === 'admin' || role === 'super_admin'
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