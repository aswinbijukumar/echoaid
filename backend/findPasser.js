import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function findPasser() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find Level 0 quizzes
        const l0Quizzes = await Quiz.find({ level: 0 });
        const l0QuizIds = l0Quizzes.map(q => q._id);
        console.log(`Checking attempts for Quiz IDs: ${l0QuizIds.join(', ')}`);

        // Find successful attempts for these quizzes
        const successfulAttempts = await QuizAttempt.find({
            quizId: { $in: l0QuizIds },
            passed: true
        }).sort({ completedAt: -1 });

        console.log(`Found ${successfulAttempts.length} successful Level 0 attempts.`);

        for (const a of successfulAttempts) {
            const user = await User.findById(a.userId);
            console.log(`- SUCCESS: User "${user ? user.name : 'Unknown'}" (${a.userId}) passed with ${a.percentage}% on ${a.completedAt}`);

            // Check if they have the certificate
            const cert = await Certificate.findOne({ user: a.userId, title: /Level 0/i });
            if (cert) {
                console.log(`  - Certificate already exists: "${cert.title}"`);
            } else {
                console.log(`  - NO CERTIFICATE FOUND for this successful attempt!`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findPasser();
