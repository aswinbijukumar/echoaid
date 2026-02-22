import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function fixQuiz() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Fix Level 0 Mastery Quizz (was level 1)
        const res = await Quiz.updateOne(
            { _id: '68f7570ab61fdab754dc00ad' },
            { level: 0 }
        );
        console.log('Update result:', res);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixQuiz();
