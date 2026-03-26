import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String,
            isActive: Boolean
        }));
        const users = await User.find({}, 'email role isActive').limit(1);
        if (users.length > 0) {
            fs.writeFileSync(path.join(__dirname, 'user_id.txt'), users[0]._id.toString());
            console.log('User ID saved to user_id.txt');
        } else {
            console.log('No users found');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
