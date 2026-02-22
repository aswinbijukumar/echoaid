import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function findAnyLevel0Pass() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const attempts = await QuizAttempt.find({ passed: true }).sort({ completedAt: -1 });
        console.log(`Total Successful Attempts: ${attempts.length}`);

        for (const a of attempts) {
            const q = await Quiz.findById(a.quizId);
            if (!q) continue;

            const user = await User.findById(a.userId);
            console.log(`- User: ${user ? user.name : 'Unknown'} (${a.userId}) passed "${q.title}" (Level: ${q.level}, ID: ${q._id}) on ${a.completedAt}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findAnyLevel0Pass();
