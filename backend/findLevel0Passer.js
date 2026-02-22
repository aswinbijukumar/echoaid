import mongoose from 'mongoose';
import User from './models/User.js';
import QuizAttempt from './models/QuizAttempt.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function findLevel0() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all successful attempts for the specific Level 0 Mastery Quiz
        const a = await QuizAttempt.findOne({
            quizId: new mongoose.Types.ObjectId('68f7570ab61fdab754dc00ad'),
            passed: true
        }).sort({ completedAt: -1 });

        if (!a) {
            console.log('NO_SPECIFIC_SUCCESS_FOUND_FOR_68f7570ab61fdab754dc00ad');
            process.exit(0);
        }

        const u = await User.findById(a.userId);

        console.log('--- LEVEL 0 SUCCESS FOUND ---');
        console.log(JSON.stringify({
            user: u ? u.name : 'Unknown',
            userId: a.userId,
            date: a.completedAt
        }, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findLevel0();
