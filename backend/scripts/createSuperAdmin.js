import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'superadmin@echoaid.com' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log(`Active: ${existingSuperAdmin.isActive}`);
      console.log(`Last Login: ${existingSuperAdmin.lastLogin || 'Never'}`);
      process.exit(0);
    }

    // Check if any super admins exist at all
    const superAdminCount = await User.countDocuments({ role: 'super_admin' });
    if (superAdminCount === 0) {
      console.log('⚠️  No super admins found in the system!');
      console.log('Creating initial super admin...');
    }

    // Create super admin user
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@echoaid.com',
      password: 'SuperAdmin123!', // Use original password, will be hashed by pre-save hook
      role: 'super_admin',
      isEmailVerified: true,
      isActive: true,
      permissions: {
        manageUsers: true,
        manageContent: true,
        manageSystem: true,
        viewAnalytics: true,
        moderateForum: true
      }
    });

    await superAdmin.save();
    console.log('✅ Super admin created successfully');
    console.log('📧 Email: superadmin@echoaid.com');
    console.log('🔑 Password: SuperAdmin123!');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

    // Create an admin user as well
    const admin = new User({
      name: 'Admin User',
      email: 'admin@echoaid.com',
      password: 'Admin123!', // Use original password, will be hashed by pre-save hook
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      permissions: {
        manageUsers: false,
        manageContent: true,
        manageSystem: false,
        viewAnalytics: true,
        moderateForum: true
      }
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@echoaid.com');
    console.log('Password: Admin123!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin(); 