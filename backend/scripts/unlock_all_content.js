
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config.env') });

import User from '../models/User.js';
import Skill from '../models/Skill.js';
import UserSkillProgress from '../models/UserSkillProgress.js';

const unlockAll = async () => {
    try {
        const email = process.argv[2];
        if (!email) {
            console.error('❌ Please provide an email address.');
            console.log('Usage: node scripts/unlock_all_content.js <email>');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`❌ User with email ${email} not found.`);
            process.exit(1);
        }
        console.log(`👤 Found user: ${user.name} (${user._id})`);

        // 2. Get All Skills
        const skills = await Skill.find({ isActive: true });
        console.log(`📚 Found ${skills.length} active skills.`);

        // 3. Prepare Progress Items
        const skillsProgress = skills.map(skill => ({
            skill: skill._id,
            level: 5, // Max level
            isCompleted: true,
            isUnlocked: true,
            completedAt: new Date(),
            lastPracticed: new Date(),
            totalXP: 500, // Grant some XP
            attempts: 1,
            correctAnswers: 10,
            streak: 5
        }));

        // 4. Update/Create User Progress
        let userProgress = await UserSkillProgress.findOne({ user: user._id });
        if (!userProgress) {
            userProgress = new UserSkillProgress({ user: user._id });
        }

        // Replace existing skills progress or merge (replace is safer for "unlock all")
        userProgress.skills = skillsProgress;

        // Boost Stats
        userProgress.daily.progress = 1000; // Hit daily goal
        userProgress.streak = 100; // Give a nice streak
        userProgress.hearts = 5;
        userProgress.gems = 1000;

        await userProgress.save();
        console.log('🔓 All skills unlocked and marked as completed.');

        // 5. Update User Learning Stats
        user.learningStats = {
            ...user.learningStats,
            level: 10,
            totalXP: 10000,
            streak: 100,
            xpToNextLevel: 500
        };
        await user.save();
        console.log('🚀 User level bumped to 10.');

        console.log('🎉 Account fully unlocked for testing!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

unlockAll();
