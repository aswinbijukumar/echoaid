#!/usr/bin/env node

/**
 * Check Users Script
 * Lists all users in the database to help with login testing
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const checkUsers = async () => {
  console.log('👥 Checking Users in Database...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    const users = await User.find({}).select('name email role isEmailVerified createdAt');
    
    console.log(`📊 Total users: ${users.length}\n`);
    
    if (users.length > 0) {
      console.log('👤 Available Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No users found in database');
    }

    console.log('🔑 Login Instructions:');
    console.log('1. Try logging in with one of the emails above');
    console.log('2. If you don\'t know the password, try registering a new user');
    console.log('3. Or use Google OAuth login');
    console.log('4. Make sure the user\'s email is verified');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkUsers();