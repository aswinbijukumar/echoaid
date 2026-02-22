
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
dotenv.config({ path: path.join(__dirname, 'config.env') });

const debugGoogleSignup = async () => {
    try {
        console.log('1. Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('   Connected.');

        const testEmail = `test_google_${Date.now()}@example.com`;
        console.log(`2. Attempting to create user with email: ${testEmail}`);

        const userData = {
            name: "Test Google User",
            email: testEmail,
            googleId: "1234567890_test_id",
            avatar: "https://example.com/avatar.jpg",
            isEmailVerified: true,
            // Simulating the fix: Hex + Uppercase + Number + Special Char
            password: crypto.randomBytes(16).toString('hex') + 'A1!'
        };

        console.log('   Data:', JSON.stringify(userData, null, 2));

        try {
            const user = await User.create(userData);
            console.log('✅ SUCCESS: User created successfully.');
            console.log('   ID:', user._id);
            console.log('   Role:', user.role);

            // Clean up
            await User.deleteOne({ _id: user._id });
            console.log('   Test user deleted.');

        } catch (validationError) {
            console.error('❌ VALIDATION ERROR:', validationError.message);
            if (validationError.errors) {
                Object.keys(validationError.errors).forEach(key => {
                    console.error(`   - ${key}: ${validationError.errors[key].message}`);
                });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ SYSTEM ERROR:', error);
        process.exit(1);
    }
};

debugGoogleSignup();
