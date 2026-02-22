import mongoose from 'mongoose';
import User from './models/User.js';
import Certificate from './models/Certificate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const u = await User.findOne({ name: /aswin/i });
        if (!u) {
            console.log('USER_NOT_FOUND');
            process.exit(0);
        }

        const c = await Certificate.find({ user: u._id });
        console.log('--- CERTIFICATES FOR ' + u.name + ' ---');
        console.log(JSON.stringify(c, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verify();
