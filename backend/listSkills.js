import mongoose from 'mongoose';
import Skill from './models/Skill.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function listSkills() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const skills = await Skill.find({ isActive: true }).select('title level order');
        fs.writeFileSync('skills_data.json', JSON.stringify(skills, null, 2));
        console.log('Skills saved to skills_data.json');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listSkills();
