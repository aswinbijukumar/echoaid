import mongoose from 'mongoose';
import User from './models/User.js';
import QuizAttempt from './models/QuizAttempt.js';
import Quiz from './models/Quiz.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function listRecentSuccess() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const attempts = await QuizAttempt.find({ passed: true }).sort({ completedAt: -1 }).limit(10);
        console.log(`--- LAST 10 SUCCESSFUL ATTEMPTS ---`);
        for (const a of attempts) {
            const u = await User.findById(a.userId);
            const q = await Quiz.findById(a.quizId);
            console.log(`User: ${u ? u.name : 'Unknown'} (${a.userId}), Quiz: ${q ? q.title : 'Unknown'} (L${q ? q.level : '?'}), Score: ${a.percentage}%, Date: ${a.completedAt}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listRecentSuccess();
