
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'config.env') }); // Explicit path

console.log('Loading config from:', path.join(__dirname, 'config.env'));
console.log('DATABASE_URI exists:', !!process.env.DATABASE_URI);
console.log('DATABASE_LOCAL exists:', !!process.env.DATABASE_LOCAL);

const fixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const result = await User.updateMany({}, { $set: { isActive: true } });
        console.log(`Updated ${result.modifiedCount} users to active status.`);

        // Also check if any users were missing the field
        const users = await User.find({});
        console.log(`Total users checked: ${users.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error fixing users:', error);
        process.exit(1);
    }
};

fixUsers();
