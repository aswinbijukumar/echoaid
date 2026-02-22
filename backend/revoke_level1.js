import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Certificate from './models/Certificate.js';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const resetLevel1 = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete ALL certificates with title 'Level 1 Mastery' (for dev env this is fine)
        // Or we could try to find the specific user if we knew their email.
        // Let's just delete Level 1 Mastery certs to be sure.

        const result = await Certificate.deleteMany({
            title: { $regex: /Level 1 Mastery/i }
        });

        console.log(`Deleted ${result.deletedCount} 'Level 1 Mastery' certificates.`);

        const count = await Certificate.countDocuments({ title: { $regex: /Level 1 Mastery/i } });
        console.log(`Remaining Level 1 certs: ${count}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

resetLevel1();
