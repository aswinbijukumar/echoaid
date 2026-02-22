import mongoose from 'mongoose';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import Certificate from './models/Certificate.js';
import UserSkillProgress from './models/UserSkillProgress.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/echoaid';

async function checkUserProgress() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne().sort({ createdAt: -1 });
        if (!user) {
            console.log('No user found');
            process.exit(0);
        }

        console.log(`User: ${user.name} (${user.email}) - ID: ${user._id}`);

        const allQuizzes = await Quiz.find({ isActive: true });
        console.log(`Total Active Quizzes: ${allQuizzes.length}`);
        allQuizzes.forEach(q => console.log(`- ${q.title} (Level: ${q.level}, ID: ${q._id})`));

        const allAttempts = await QuizAttempt.find({ userId: user._id });
        console.log(`Total Attempts for User: ${allAttempts.length}`);
        for (const a of allAttempts) {
            const q = allQuizzes.find(qz => qz._id.toString() === a.quizId.toString());
            console.log(`- Quiz: ${q ? q.title : a.quizId}, Score: ${a.percentage}%, Passed: ${a.passed}, Date: ${a.completedAt}`);
        }

        const skillProgress = await UserSkillProgress.findOne({ user: user._id });
        if (skillProgress) {
            console.log(`Skill Progress found with ${skillProgress.skills.length} items`);
        } else {
            console.log('No Skill Progress found');
        }

        const certs = await Certificate.find({ user: user._id });
        console.log(`Certificates: ${certs.length}`);
        certs.forEach(c => {
            console.log(`- Title: ${c.title}, Type: ${c.type}, Code: ${c.certificateCode}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUserProgress();
