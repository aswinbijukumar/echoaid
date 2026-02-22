
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import all models
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import Sign from './models/Sign.js';
import Lesson from './models/Lesson.js';
import Unit from './models/Unit.js';
import Skill from './models/Skill.js';
import Category from './models/Category.js';
import QuestionBank from './models/QuestionBank.js';
import Achievement from './models/Achievement.js';
import UserProgress from './models/UserProgress.js';
import PracticeAttempt from './models/PracticeAttempt.js';
import QuizAttempt from './models/QuizAttempt.js';
import Exercise from './models/Exercise.js';
import LearningPath from './models/LearningPath.js';
import Message from './models/Message.js';
import AuditLog from './models/AuditLog.js';
import Video from './models/Video.js';
// Add any other models here

import UserSkillProgress from './models/UserSkillProgress.js';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config.env') });

const LOCAL_URI = 'mongodb://localhost:27017/echoaid';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
    console.error('❌ MONGODB_URI (Atlas) is not defined in config.env');
    process.exit(1);
}

const models = [
    { name: 'User', model: User },
    { name: 'Quiz', model: Quiz },
    { name: 'Sign', model: Sign },
    { name: 'Lesson', model: Lesson },
    { name: 'Unit', model: Unit },
    { name: 'Skill', model: Skill },
    { name: 'Category', model: Category },
    { name: 'QuestionBank', model: QuestionBank },
    { name: 'Achievement', model: Achievement },
    { name: 'UserProgress', model: UserProgress },
    { name: 'UserSkillProgress', model: UserSkillProgress },
    { name: 'PracticeAttempt', model: PracticeAttempt },
    { name: 'QuizAttempt', model: QuizAttempt },
    { name: 'Exercise', model: Exercise },
    { name: 'LearningPath', model: LearningPath },
    { name: 'Message', model: Message },
    { name: 'AuditLog', model: AuditLog },
    { name: 'Video', model: Video },
];

async function migrate() {
    console.log('🚀 Starting Migration: Local -> Atlas');
    console.log(`📂 Local: ${LOCAL_URI}`);
    console.log(`☁️  Atlas: ${ATLAS_URI.split('@')[1]}`); // Log only host part for security

    let localData = {};

    // 1. Fetch from Local
    try {
        console.log('\n📡 Connecting to LOCAL Database...');
        await mongoose.connect(LOCAL_URI);
        console.log('✅ Connected to LOCAL.');

        for (const { name, model } of models) {
            const count = await model.countDocuments();
            console.log(`   - Fetching ${count} ${name}s...`);
            if (count > 0) {
                localData[name] = await model.find({}).lean();
            }
        }

        await mongoose.disconnect();
        console.log('🔌 Disconnected from LOCAL.');

    } catch (error) {
        console.error('❌ Error fetching from Local:', error);
        process.exit(1);
    }

    // 2. Insert into Atlas
    try {
        console.log('\n📡 Connecting to ATLAS Database...');
        await mongoose.connect(ATLAS_URI);
        console.log('✅ Connected to ATLAS.');

        for (const { name, model } of models) {
            const items = localData[name];
            if (!items || items.length === 0) {
                console.log(`   - No data for ${name}, skipping.`);
                continue;
            }

            console.log(`   - Migrating ${items.length} ${name}s...`);

            let successCount = 0;
            let errorCount = 0;

            for (const item of items) {
                try {
                    // Use findOneAndUpdate with upsert to avoid duplicates and update existing
                    await model.findByIdAndUpdate(item._id, item, { upsert: true, new: true });
                    successCount++;
                } catch (e) {
                    console.error(`     ❌ Failed to migrate ${name} ${item._id}: ${e.message}`);
                    errorCount++;
                }
            }
            console.log(`     ✅ ${successCount} inserted/updated. ⚠️  ${errorCount} failed.`);
        }

        console.log('\n🎉 Migration Complete!');
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error writing to Atlas:', error);
        process.exit(1);
    }
}

migrate();
