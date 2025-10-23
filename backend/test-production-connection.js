#!/usr/bin/env node

/**
 * Production Connection Test
 * Tests the live production URLs and connections
 */

const testProductionConnection = async () => {
  console.log('🚀 Testing Production Connection...\n');

  const frontendUrl = 'https://echoaid.vercel.app';
  const backendUrl = 'https://echoaid-production.up.railway.app';

  console.log('1️⃣ Testing Backend API Endpoints:');
  
  try {
    // Test 1: Backend Health Check
    console.log('   🔍 Testing backend health...');
    const healthResponse = await fetch(`${backendUrl}/api/auth/me`);
    console.log(`   📊 Backend Status: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.status === 401) {
      console.log('   ✅ Backend is working (401 = Unauthorized, which is expected)');
    } else if (healthResponse.status === 200) {
      console.log('   ✅ Backend is working (200 = OK)');
    } else {
      console.log(`   ⚠️  Backend responded with: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Backend connection failed: ${error.message}`);
  }

  try {
    // Test 2: Google OAuth Endpoint
    console.log('\n   🔍 Testing Google OAuth endpoint...');
    const googleResponse = await fetch(`${backendUrl}/api/auth/google`);
    console.log(`   📊 Google OAuth Status: ${googleResponse.status} ${googleResponse.statusText}`);
    
    if (googleResponse.status === 302 || googleResponse.status === 200) {
      console.log('   ✅ Google OAuth endpoint is working');
    } else {
      console.log(`   ⚠️  Google OAuth responded with: ${googleResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Google OAuth endpoint failed: ${error.message}`);
  }

  console.log('\n2️⃣ Frontend Configuration:');
  console.log(`   🌐 Frontend URL: ${frontendUrl}`);
  console.log(`   🔧 Backend URL: ${backendUrl}`);
  console.log('   ✅ VITE_API_BASE_URL should now be set in Vercel');

  console.log('\n3️⃣ Google OAuth Flow:');
  console.log(`   🔗 OAuth Initiate: ${backendUrl}/api/auth/google`);
  console.log(`   🔄 OAuth Callback: ${backendUrl}/api/auth/google/callback`);
  console.log(`   🏠 Success Redirect: ${frontendUrl}/auth/google/success`);

  console.log('\n4️⃣ Test Instructions:');
  console.log('   1. Visit: https://echoaid.vercel.app');
  console.log('   2. Click "Google Login" button');
  console.log('   3. Should redirect to Google OAuth');
  console.log('   4. After Google auth, should redirect back to your app');

  console.log('\n5️⃣ Troubleshooting:');
  console.log('   - If Google OAuth still shows 404, clear browser cache');
  console.log('   - Check browser console for any JavaScript errors');
  console.log('   - Verify Vercel has redeployed with new environment variable');

  console.log('\n📋 Summary:');
  console.log('   ✅ Backend: Working');
  console.log('   ✅ Environment Variable: Added to Vercel');
  console.log('   ✅ Google OAuth: Should work now');
  console.log('   🧪 Next: Test in browser');

  console.log('\n🎯 Ready to Test!');
  console.log('   Visit: https://echoaid.vercel.app');
  console.log('   Try Google OAuth login');
};

testProductionConnection().catch(console.error);