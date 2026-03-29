import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/config.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        // 1. Get current user (latest login)
        const users = await db.collection('users').find({}).sort({ lastLogin: -1 }).limit(1).toArray();
        if (users.length === 0) {
            console.log('No users found.');
            process.exit(0);
        }
        const user = users[0];
        console.log(`User: ${user.email} (ID: ${user._id})`);
        console.log(`Learning Stats:`, JSON.stringify(user.learningStats, null, 2));

        // 2. Get UserProgress
        const progress = await db.collection('userprogresses').findOne({ user: user._id });
        console.log(`UserProgress:`, JSON.stringify(progress, null, 2));

        // 3. Get Certificates
        const certs = await db.collection('certificates').find({ user: user._id }).toArray();
        console.log(`Certificates:`, JSON.stringify(certs, null, 2));

        // 4. Check Level 1 unlocking logic
        const unitsLevel0 = await db.collection('units').find({ level: 0 }).sort({ order: 1 }).toArray();
        const unitsLevel1 = await db.collection('units').find({ level: 1 }).sort({ order: 1 }).toArray();
        console.log(`Units Level 0:`, unitsLevel0.map(u => ({ title: u.title, order: u.order, prereqs: u.prerequisites })));
        console.log(`Units Level 1:`, unitsLevel1.map(u => ({ title: u.title, order: u.order, prereqs: u.prerequisites })));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
