import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function forceIssue() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Find the user who most recently submitted ANY quiz attempt
        const lastAttempt = await QuizAttempt.findOne().sort({ completedAt: -1 });

        if (!lastAttempt) {
            console.log('No quiz attempts found in the system at all.');
            process.exit(0);
        }

        const user = await User.findById(lastAttempt.userId);
        if (!user) {
            console.log('User for the last attempt not found.');
            process.exit(0);
        }

        console.log(`\nIdentified User: ${user.name} (${user.email})`);
        console.log(`Last Activity: ${lastAttempt.completedAt} (Quiz: ${lastAttempt.quizId})`);

        // 2. Issue Level 0 Mastery Certificate to THIS user
        // The user specifically wants THIS unlocked.

        const certTitle = 'Level 0 Mastery';

        // Check if they already have a "Level 0" certificate
        let cert = await Certificate.findOne({
            user: user._id,
            title: /Level 0/i
        });

        if (cert) {
            console.log(`User already has certificate: "${cert.title}". Updating title to "${certTitle}"...`);
            cert.title = certTitle;
            // Ensure it's marked as level_mastery
            cert.type = 'level_mastery';
            await cert.save();
        } else {
            console.log(`Issuing new "${certTitle}" certificate...`);
            cert = new Certificate({
                user: user._id,
                title: certTitle,
                type: 'level_mastery',
                // Use a generic code if reference is unknown, but we have quizId from last attempt
                referenceId: lastAttempt.quizId,
                referenceModel: 'Quiz'
            });
            await cert.save();
        }

        console.log(`\n✅ SUCCESS: Certificate "${cert.title}" is now UNLOCKED for ${user.name}.`);
        console.log(`Certificate Code: ${cert.certificateCode}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

forceIssue();
