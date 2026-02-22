import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import UserSkillProgress from './models/UserSkillProgress.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function findAnandu() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find user anandu
        const users = await User.find({ name: /anandu/i });
        if (users.length === 0) {
            console.log('User "anandu" not found.');
            process.exit(0);
        }

        for (const user of users) {
            console.log(`\n--- User: ${user.name} (${user.email}) - ID: ${user._id} ---`);

            const attempts = await QuizAttempt.find({ userId: user._id });
            console.log(`Total Attempts: ${attempts.length}`);
            for (const a of attempts) {
                const quiz = await Quiz.findById(a.quizId);
                console.log(`- Quiz: ${quiz ? quiz.title : a.quizId} (Level: ${quiz ? quiz.level : '?'}), Score: ${a.percentage}%, Passed: ${a.passed}, Date: ${a.completedAt}`);
            }

            const progress = await UserSkillProgress.findOne({ user: user._id });
            if (progress) {
                console.log(`Completed Skills: ${progress.skills.filter(s => s.isCompleted).length}`);
            }

            const certs = await Certificate.find({ user: user._id });
            console.log(`Certificates: ${certs.length}`);
            certs.forEach(c => console.log(`  - Title: ${c.title}`));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findAnandu();
