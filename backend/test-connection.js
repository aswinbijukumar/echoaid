#!/usr/bin/env node

/**
 * Connection Test Script
 * Tests the connection between frontend and backend
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const testConnection = async () => {
  console.log('🔍 Testing EchoAid Connection...\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables:');
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ Missing'}`);
  console.log(`   BACKEND_URL: ${process.env.BACKEND_URL || '❌ Missing'}`);
  console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}\n`);

  // Test 2: Database Connection
  console.log('2️⃣ Testing Database Connection:');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ Database connected successfully');
    
    // Test 3: User Count
    const userCount = await User.countDocuments();
    console.log(`   📊 Total users in database: ${userCount}`);
    
    // Test 4: Sample User (if any)
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('name email role');
      console.log(`   👤 Sample user: ${sampleUser.name} (${sampleUser.email}) - Role: ${sampleUser.role}`);
    }
    
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
  }

  // Test 5: CORS Configuration
  console.log('\n3️⃣ CORS Configuration:');
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`   Backend URL: ${process.env.BACKEND_URL || 'Not set'}`);

  // Test 6: Google OAuth URLs
  console.log('\n4️⃣ Google OAuth URLs:');
  const backendUrl = process.env.BACKEND_URL || 'https://echoaid-production.up.railway.app';
  const frontendUrl = process.env.FRONTEND_URL || 'https://echoaid.vercel.app';
  console.log(`   Google Callback URL: ${backendUrl}/api/auth/google/callback`);
  console.log(`   Frontend URL: ${frontendUrl}`);

  console.log('\n✅ Connection test completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Make sure VITE_API_BASE_URL is set in Vercel');
  console.log('2. Update Google OAuth redirect URIs');
  console.log('3. Verify Railway environment variables');
  console.log('4. Test login with existing user credentials');

  process.exit(0);
};

testConnection().catch(console.error);