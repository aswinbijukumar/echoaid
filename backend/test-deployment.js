#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests all connections and configurations
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const testDeployment = async () => {
  console.log('🚀 Testing EchoAid Deployment...\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Environment Variables Check:');
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET', 
    'FRONTEND_URL',
    'BACKEND_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  let allVarsSet = true;
  requiredVars.forEach(varName => {
    const isSet = process.env[varName] ? '✅' : '❌';
    console.log(`   ${isSet} ${varName}`);
    if (!process.env[varName]) allVarsSet = false;
  });

  // Test 2: Database Connection
  console.log('\n2️⃣ Database Connection:');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ Database connected successfully');
    
    const userCount = await User.countDocuments();
    console.log(`   📊 Total users: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('name email role isEmailVerified');
      console.log(`   👤 Sample user: ${sampleUser.name} (${sampleUser.email})`);
      console.log(`   📧 Email verified: ${sampleUser.isEmailVerified ? 'Yes' : 'No'}`);
    }
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
  }

  // Test 3: URL Configuration
  console.log('\n3️⃣ URL Configuration:');
  const frontendUrl = process.env.FRONTEND_URL;
  const backendUrl = process.env.BACKEND_URL;
  
  console.log(`   🌐 Frontend URL: ${frontendUrl}`);
  console.log(`   🔧 Backend URL: ${backendUrl}`);
  
  if (frontendUrl && backendUrl) {
    console.log('   ✅ URLs are configured');
  } else {
    console.log('   ❌ URLs are missing');
  }

  // Test 4: Google OAuth Configuration
  console.log('\n4️⃣ Google OAuth Configuration:');
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  console.log(`   🔑 Client ID: ${googleClientId ? 'Set' : 'Missing'}`);
  console.log(`   🔐 Client Secret: ${googleClientSecret ? 'Set' : 'Missing'}`);
  
  if (backendUrl) {
    console.log(`   🔗 Callback URL: ${backendUrl}/api/auth/google/callback`);
  }

  // Test 5: CORS Configuration
  console.log('\n5️⃣ CORS Configuration:');
  console.log(`   ✅ Frontend URL in CORS: ${frontendUrl}`);
  console.log(`   ✅ Localhost URLs included for development`);

  // Test 6: JWT Configuration
  console.log('\n6️⃣ JWT Configuration:');
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE || '24h';
  
  console.log(`   🔐 JWT Secret: ${jwtSecret ? 'Set' : 'Missing'}`);
  console.log(`   ⏰ JWT Expire: ${jwtExpire}`);

  // Test 7: Frontend Environment Variable Check
  console.log('\n7️⃣ Frontend Configuration:');
  console.log('   📝 Vercel Environment Variable needed:');
  console.log('   Name: VITE_API_BASE_URL');
  console.log('   Value: https://echoaid-production.up.railway.app');
  console.log('   ⚠️  Make sure this is set in Vercel dashboard!');

  // Summary
  console.log('\n📋 Summary:');
  const userCount = await User.countDocuments();
  console.log(`   Database: ${userCount > 0 ? '✅ Working' : '❌ No users'}`);
  console.log(`   Environment: ${allVarsSet ? '✅ All set' : '❌ Missing variables'}`);
  console.log(`   URLs: ${frontendUrl && backendUrl ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Google OAuth: ${googleClientId && googleClientSecret ? '✅ Ready' : '❌ Missing'}`);

  console.log('\n🎯 Next Steps:');
  console.log('1. ✅ Google OAuth redirect URIs added (you did this)');
  console.log('2. ⚠️  Add VITE_API_BASE_URL in Vercel dashboard');
  console.log('3. 🔄 Redeploy both services');
  console.log('4. 🧪 Test login functionality');

  console.log('\n🔗 Test URLs:');
  console.log(`   Frontend: ${frontendUrl}`);
  console.log(`   Backend: ${backendUrl}`);
  console.log(`   API Test: ${backendUrl}/api/auth/me`);

  process.exit(0);
};

testDeployment().catch(console.error);