import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

console.log('Testing Cloudinary Configuration...');
console.log('Environment variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('\nCloudinary Configuration:');
const config = cloudinary.config();
console.log('Cloud Name:', config.cloud_name);
console.log('API Key:', config.api_key);
console.log('API Secret:', config.api_secret ? 'Set' : 'Not Set');

// Test Cloudinary connection
async function testCloudinary() {
  try {
    const result = await cloudinary.api.ping();
    console.log('\n✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
  } catch (error) {
    console.error('\n❌ Cloudinary connection failed:', error.message);
  }
}

testCloudinary();