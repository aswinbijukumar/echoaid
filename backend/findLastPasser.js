import mongoose from 'mongoose';
import User from './models/User.js';
import QuizAttempt from './models/QuizAttempt.js';
import Quiz from './models/Quiz.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function findLast() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find the absolute most recent successful attempt for ANY quiz
        const a = await QuizAttempt.findOne({ passed: true }).sort({ completedAt: -1 });
        if (!a) {
            console.log('NO_SUCCESS_FOUND');
            process.exit(0);
        }

        const u = await User.findById(a.userId);
        const q = await Quiz.findById(a.quizId);

        console.log('--- RECENT SUCCESS ---');
        console.log(JSON.stringify({
            user: u ? u.name : 'Unknown',
            userId: a.userId,
            quiz: q ? q.title : 'Unknown',
            level: q ? q.level : '?',
            score: a.percentage,
            date: a.completedAt
        }, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findLast();
