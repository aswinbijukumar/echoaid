import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function findAnySuccess() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all successful attempts
        const successfulAttempts = await QuizAttempt.find({
            passed: true
        }).sort({ completedAt: -1 }).limit(20);

        console.log(`Found ${successfulAttempts.length} total successful attempts (showing last 20).`);

        for (const a of successfulAttempts) {
            const user = await User.findById(a.userId);
            const quiz = await Quiz.findById(a.quizId);
            console.log(`- SUCCESS: User "${user ? user.name : 'Unknown'}" passed "${quiz ? quiz.title : 'Unknown Quiz'}" (Level: ${quiz ? quiz.level : '?'}) with ${a.percentage}% on ${a.completedAt}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findAnySuccess();
