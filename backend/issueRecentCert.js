import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function issueCertificateToRecentPasser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find the absolute most recent successful quiz attempt
        const recentSuccess = await QuizAttempt.findOne({ passed: true })
            .sort({ completedAt: -1 });

        if (!recentSuccess) {
            console.log('No successful quiz attempts found.');
            process.exit(0);
        }

        const user = await User.findById(recentSuccess.userId);
        const quiz = await Quiz.findById(recentSuccess.quizId);

        if (!user) {
            console.log('User associated with the attempt not found.');
            process.exit(0);
        }

        console.log(`\nMost Recent Successful Attempt:`);
        console.log(`- User: ${user.name} (${user.email})`);
        console.log(`- Quiz: ${quiz ? quiz.title : 'Unknown'} (Level: ${quiz ? quiz.level : '?'})`);
        console.log(`- Date: ${recentSuccess.completedAt}`);

        // 2. Issue Level 0 Mastery Certificate (since the user says they completed level 0)
        // Even if the quiz was Level 1, if they passed their "first" mastery, we issue Level 0
        // But usually we issue it based on the quiz level. 
        // The user specifically wants the Level 0 Mastery certificate unlocked.

        const certTitle = 'Level 0 Mastery';

        const existingCert = await Certificate.findOne({
            user: user._id,
            title: certTitle
        });

        if (existingCert) {
            console.log(`User ${user.name} already has the "${certTitle}" certificate.`);
        } else {
            console.log(`Issuing "${certTitle}" certificate for ${user.name}...`);
            const newCert = new Certificate({
                user: user._id,
                title: certTitle,
                type: 'level_mastery',
                referenceId: recentSuccess.quizId,
                referenceModel: 'Quiz'
            });
            await newCert.save();
            console.log(`SUCCESS: Issued Certificate to ${user.name}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

issueCertificateToRecentPasser();
