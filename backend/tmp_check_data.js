import mongoose from 'mongoose';
import Unit from './models/Unit.js';
import Lesson from './models/Lesson.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './config.env' });

async function check() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const units = await Unit.find({}).sort({ order: 1 }).limit(10);
        console.log('--- UNITS ---');
        units.forEach(u => {
            console.log(`Unit: ${u.title}, Order: ${u.order}, Prerequisites: ${u.prerequisites}`);
        });

        const lessons = await Lesson.find({}).sort({ unit: 1, order: 1 }).limit(10);
        console.log('\n--- LESSONS ---');
        lessons.forEach(l => {
            console.log(`Lesson: ${l.title}, UnitID: ${l.unit}, Order: ${l.order}, Prerequisites: ${l.prerequisites}`);
        });

        const certs = await mongoose.connection.db.collection('certificates').find({}).limit(5).toArray();
        console.log('\n--- CERTIFICATES (first 5) ---');
        certs.forEach(c => {
            console.log(`Cert: ${c.title}, User: ${c.user}, Level: ${c.level}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
