import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ENV_CONFIG } from './config/prettyConfig.js';

// Load env
dotenv.config();
dotenv.config({ path: './config.env' }); // Try both

console.log('--- JWT DEBUG CYCLE ---');
console.log('JWT_SECRET (env):', process.env.JWT_SECRET);
console.log('JWT_SECRET (config):', ENV_CONFIG.JWT_SECRET);

// Simulated User ID
const userId = new mongoose.Types.ObjectId();
console.log('Generated User ID:', userId.toString());

// Test Generation
const secret = ENV_CONFIG.JWT_SECRET;
const token = jwt.sign({ id: userId }, secret, {
    expiresIn: '1d'
});

console.log('Generated Token:', token);

// Test Verification
try {
    const decoded = jwt.verify(token, secret);
    console.log('✅ Verification Successful!');
    console.log('Decoded ID:', decoded.id);

    if (decoded.id === userId.toString()) {
        console.log('✅ ID Match');
    } else {
        console.error('❌ ID Mismatch');
    }
} catch (error) {
    console.error('❌ Verification Failed:', error.message);
}

// Test Database Connection (Simulated to check if DB is reachable)
console.log('\n--- DATABASE DEBUG ---');
console.log('MONGODB_URI (env):', process.env.MONGODB_URI);
console.log('MONGODB_URI (config):', ENV_CONFIG.MONGODB_URI);

// Verify if User exists
import User from './models/User.js';
const testDb = async () => {
    try {
        await mongoose.connect(ENV_CONFIG.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Count users
        const count = await User.countDocuments();
        console.log(`Total Users in DB: ${count}`);

        // Check if we can find a user
        const user = await User.findOne();
        if (user) {
            console.log('Sample User found:', user.email, user._id.toString());

            // Generate token for REAL user
            const realToken = jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });
            console.log('Real User Token:', realToken);

            // Decode
            const decodedReal = jwt.verify(realToken, secret);
            console.log('Decoded Real ID:', decodedReal.id);
        } else {
            console.warn('⚠️ No users found in DB');
        }

    } catch (e) {
        console.error('❌ DB Connection Error:', e);
    } finally {
        await mongoose.disconnect();
    }
};

testDb();
