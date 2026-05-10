import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Certificate from '../models/Certificate.js';

dotenv.config({ path: './config.env' });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
await mongoose.connect(uri);
console.log('Connected to MongoDB');

const result = await Certificate.deleteMany({ type: 'level_mastery' });
console.log(`✅ Deleted ${result.deletedCount} stale level_mastery certificate(s)`);

await mongoose.disconnect();
console.log('Done.');
