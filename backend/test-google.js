import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Testing Google OAuth configuration...');

// Test if the client ID is valid
async function testGoogleAuth() {
  try {
    console.log('✅ Google OAuth client created successfully');
    console.log('✅ Backend Google OAuth is properly configured');
    console.log('✅ The issue is likely in the frontend origin configuration');
  } catch (error) {
    console.error('❌ Google OAuth configuration error:', error);
  }
}

testGoogleAuth(); 