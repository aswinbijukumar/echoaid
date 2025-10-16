import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: join(__dirname, '../config.env') });

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Verify Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  Razorpay API keys not found in environment variables');
  console.warn('   Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in your .env file');
} else {
  console.log('✅ Razorpay configured successfully');
  console.log(`   Key ID: ${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...`);
}

export default razorpay;