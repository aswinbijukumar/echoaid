import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find().sort({ updatedAt: -1 }).limit(10);
        console.log('--- USER LIST (Last Updated) ---');
        users.forEach(u => console.log(`Name: ${u.name}, ID: ${u._id}, Email: ${u.email}`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
