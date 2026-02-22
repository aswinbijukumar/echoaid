import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function issueCert() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find the absolute most recent successful attempt for ANY Level 0/1 Mastery quiz
        const recentSuccess = await QuizAttempt.findOne({ passed: true })
            .sort({ completedAt: -1 });

        if (!recentSuccess) {
            console.log('No successful quiz attempts found in the system.');
            process.exit(0);
        }

        const user = await User.findById(recentSuccess.userId);
        const quiz = await Quiz.findById(recentSuccess.quizId);

        console.log(`\nMost Recent Success:`);
        console.log(`- User: ${user ? user.name : 'Unknown'} (${recentSuccess.userId})`);
        console.log(`- Quiz: ${quiz ? quiz.title : 'Unknown'} (Level: ${quiz ? quiz.level : '?'})`);
        console.log(`- Score: ${recentSuccess.percentage}%`);
        console.log(`- Date: ${recentSuccess.completedAt}`);

        if (!user) {
            console.log('User not found.');
            process.exit(0);
        }

        // 2. Issue Level 0 Mastery Certificate to this specific user
        // We'll search if they already have one first
        const existingCert = await Certificate.findOne({
            user: user._id,
            title: /Level 0 Mastery|Level 0 Basics/i
        });

        if (existingCert) {
            console.log(`User already has a certificate: "${existingCert.title}"`);
            if (existingCert.title === 'Level 0 Basics') {
                existingCert.title = 'Level 0 Mastery';
                await existingCert.save();
                console.log('Renamed existing certificate to "Level 0 Mastery"');
            }
        } else {
            console.log('Issuing NEW Level 0 Mastery Certificate...');
            const newCert = new Certificate({
                user: user._id,
                title: 'Level 0 Mastery',
                type: 'level_mastery',
                referenceId: recentSuccess.quizId,
                referenceModel: 'Quiz'
            });
            await newCert.save();
            console.log(`SUCCESS: Issued Certificate ${newCert.certificateCode} to ${user.name}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

issueCert();
