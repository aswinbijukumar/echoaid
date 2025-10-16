import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import razorpay from './config/razorpay.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, 'config.env') });

async function testRazorpayConnection() {
  try {
    console.log('🔍 Testing Razorpay connection...');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : 'Not found');
    console.log('Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Not found');
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not found in environment variables');
      return;
    }

    // Test creating a simple order
    console.log('📝 Creating test order...');
    const order = await razorpay.orders.create({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: {
        test: 'true',
        userId: 'test_user'
      }
    });

    console.log('✅ Order created successfully!');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount);
    console.log('Currency:', order.currency);
    console.log('Status:', order.status);

    // Test fetching the order
    console.log('📖 Fetching order details...');
    const fetchedOrder = await razorpay.orders.fetch(order.id);
    console.log('✅ Order fetched successfully!');
    console.log('Fetched Order Status:', fetchedOrder.status);

  } catch (error) {
    console.error('❌ Razorpay test failed:', error.message);
    if (error.error) {
      console.error('Error details:', error.error);
    }
  }
}

// Run the test
testRazorpayConnection();