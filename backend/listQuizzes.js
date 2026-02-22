import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function listQuizzes() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const quizzes = await Quiz.find({ isActive: true }).select('title level quizType maxAttempts passingScore');
        fs.writeFileSync('quizzes_data.json', JSON.stringify(quizzes, null, 2));
        console.log('Quizzes saved to quizzes_data.json');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listQuizzes();
