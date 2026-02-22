
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
dotenv.config({ path: path.join(__dirname, 'config.env') });

const testLoginFlow = async () => {
    try {
        console.log('1. Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('   Connected.');

        console.log('2. Creating/Finding Test User...');
        const testEmail = 'test_login_flow_' + Date.now() + '@example.com';
        const user = await User.create({
            name: 'Test Login Flow',
            email: testEmail,
            password: 'Password123!',
            role: 'user',
            isEmailVerified: true,
            isActive: true
        });
        console.log(`   User created: ${user.email} (ID: ${user._id})`);
        console.log(`   isActive: ${user.isActive}`);

        console.log('3. Generating Token...');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        console.log('   Token generated.');

        console.log('4. Testing /api/auth/me...');
        // Assume server is running on localhost:5000 (as per config.env PORT)
        const port = process.env.PORT || 5000;
        const url = `http://localhost:${port}/api/auth/me`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`   Response Status: ${response.status} ${response.statusText}`);

        const data = await response.json();
        console.log('   Response Data:', JSON.stringify(data, null, 2));

        if (response.status === 200) {
            console.log('✅ SUCCESS: Login flow works for new user.');
        } else {
            console.log('❌ FAILURE: Login flow failed.');
        }

        // Cleanup
        console.log('5. Cleaning up...');
        await User.deleteOne({ _id: user._id });
        console.log('   Test user deleted.');

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
};

testLoginFlow();
