import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function listEverything() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find().select('name email _id');
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) - ID: ${u._id}`));

        const attempts = await QuizAttempt.find();
        console.log(`Total Quiz Attempts: ${attempts.length}`);
        for (const a of attempts) {
            console.log(`- UserID: ${a.userId}, QuizID: ${a.quizId}, Score: ${a.percentage}%, Passed: ${a.passed}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listEverything();
