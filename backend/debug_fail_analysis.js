
import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const debugFailure = async () => {
    await connectDB();

    // 1. Find the user 'aswinblm10' (or verify who it is) - based on previous context, user is 'ASWIN' or 'anandu'
    // Let's find the most recent attempt overall to be sure.

    const lastAttempt = await QuizAttempt.findOne({})
        .sort({ completedAt: -1 })
        .populate('quizId')
        .populate('userId');

    if (!lastAttempt) {
        console.log("No attempts found.");
        process.exit();
    }

    console.log("Most Recent Attempt:");
    console.log(`User: ${lastAttempt.userId.name} (${lastAttempt.userId.email})`);
    console.log(`Quiz: ${lastAttempt.quizId.title}`);
    console.log(`Score: ${lastAttempt.percentage}%`);
    console.log(`Passed: ${lastAttempt.passed}`);
    console.log(`Attempt ID: ${lastAttempt._id}`);

    console.log("\n--- Answers Analysis ---");
    const quiz = await Quiz.findById(lastAttempt.quizId._id);

    lastAttempt.answers.forEach((ans, idx) => {
        const q = quiz.questions.find(q => q._id.toString() === ans.questionId.toString());
        if (!q) {
            console.log(`Q${idx + 1}: Question not found in quiz definition! ID: ${ans.questionId}`);
            return;
        }

        const correctOpt = q.options.find(o => o.isCorrect);

        console.log(JSON.stringify({
            question: q.question,
            userSelected: ans.selectedAnswer,
            correctAnswer: correctOpt ? correctOpt.text : 'N/A',
            isMatch: ans.selectedAnswer === (correctOpt ? correctOpt.text : ''),
            backendIsCorrect: ans.isCorrect
        }, null, 2));
    });

    process.exit();
};

debugFailure();
