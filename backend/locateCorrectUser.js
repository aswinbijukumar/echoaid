import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function locateCorrectUser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find ASWIN or similar
        const users = await User.find({ name: /aswin/i });
        console.log(`Matching users found: ${users.length}`);

        for (const user of users) {
            console.log(`- User: ${user.name}, ID: ${user._id}`);
            // Find most recent pass
            const lastPass = await QuizAttempt.findOne({ userId: user._id, passed: true }).sort({ completedAt: -1 });
            if (lastPass) {
                const quiz = await Quiz.findById(lastPass.quizId);
                console.log(`  Last Pass: "${quiz ? quiz.title : '?'}" (L${quiz ? quiz.level : '?'}) on ${lastPass.completedAt}`);

                // Issue certificate if it's a Level 0 pass
                if (quiz && quiz.level === 0) {
                    console.log('  Found Level 0 pass! Issuing certificate...');
                    const cert = await Certificate.findOneAndUpdate(
                        { user: user._id, title: /Level 0 Mastery|Level 0 Basics/i },
                        {
                            user: user._id,
                            title: 'Level 0 Mastery',
                            type: 'level_mastery',
                            referenceId: lastPass.quizId,
                            referenceModel: 'Quiz'
                        },
                        { upsert: true, new: true }
                    );
                    console.log(`  SUCCESS: Certificate ${cert.certificateCode} issued to ${user.name}`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

locateCorrectUser();
