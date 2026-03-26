#!/usr/bin/env node

/**
 * Google OAuth Flow Test
 * Tests the complete Google OAuth flow
 */

const testGoogleOAuth = async () => {
  console.log('🔐 Testing Google OAuth Flow...\n');

  const frontendUrl = 'https://echoaid.vercel.app';
  const backendUrl = 'https://echoaid-production.up.railway.app';

  console.log('1️⃣ Testing Google OAuth Initiate:');
  try {
    const response = await fetch(`${backendUrl}/api/auth/google`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('   ✅ Google OAuth initiate working');
      console.log('   🔗 Should redirect to Google login page');
    } else {
      console.log(`   ❌ Google OAuth initiate failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n2️⃣ Expected OAuth Flow:');
  console.log(`   Step 1: User clicks "Google Login"`);
  console.log(`   Step 2: Redirects to: ${backendUrl}/api/auth/google`);
  console.log(`   Step 3: Backend redirects to Google OAuth`);
  console.log(`   Step 4: User logs in with Google`);
  console.log(`   Step 5: Google redirects to: ${backendUrl}/api/auth/google/callback`);
  console.log(`   Step 6: Backend processes callback and redirects to: ${frontendUrl}/auth/google/success?token=...`);
  console.log(`   Step 7: Frontend receives token and redirects to dashboard`);

  console.log('\n3️⃣ Potential Issues:');
  console.log('   ❓ Frontend route /auth/google/success not found (404)');
  console.log('   ❓ Vercel deployment not updated with latest changes');
  console.log('   ❓ Google OAuth redirect URIs not configured correctly');

  console.log('\n4️⃣ Debugging Steps:');
  console.log('   1. Check if Vercel has redeployed with latest changes');
  console.log('   2. Visit: https://echoaid.vercel.app/auth/google/success');
  console.log('   3. Check browser console for routing errors');
  console.log('   4. Verify Google OAuth redirect URIs in Google Cloud Console');

  console.log('\n5️⃣ Google OAuth Redirect URIs to Check:');
  console.log('   Authorized redirect URIs:');
  console.log(`   - ${backendUrl}/api/auth/google/callback`);
  console.log(`   - ${frontendUrl}`);
  console.log(`   - ${frontendUrl}/`);
  console.log('');
  console.log('   Authorized JavaScript origins:');
  console.log(`   - ${frontendUrl}`);
  console.log(`   - ${backendUrl}`);

  console.log('\n🎯 Next Steps:');
  console.log('   1. Wait for Vercel to fully redeploy (2-3 minutes)');
  console.log('   2. Clear browser cache and try again');
  console.log('   3. Check if /auth/google/success route exists');
  console.log('   4. Test the complete OAuth flow');
};

testGoogleOAuth().catch(console.error);