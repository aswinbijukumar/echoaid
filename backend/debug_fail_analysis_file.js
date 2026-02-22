
import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';
import User from './models/User.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) {
        process.exit(1);
    }
};

const debugFailure = async () => {
    await connectDB();

    // Find most recent attempt
    const lastAttempt = await QuizAttempt.findOne({})
        .sort({ completedAt: -1 })
        .populate('quizId')
        .populate('userId');

    if (!lastAttempt) {
        fs.writeFileSync('debug_output.txt', "No attempts found.");
        process.exit();
    }

    const output = [];
    output.push("Most Recent Attempt:");
    output.push(`User: ${lastAttempt.userId.name} (${lastAttempt.userId.email})`);
    output.push(`Quiz: ${lastAttempt.quizId.title}`);
    output.push(`Score: ${lastAttempt.percentage}%`);
    output.push(`Passed: ${lastAttempt.passed}`);
    output.push(`Attempt ID: ${lastAttempt._id}`);

    output.push("\n--- Answers Analysis ---");
    const quiz = await Quiz.findById(lastAttempt.quizId._id);

    lastAttempt.answers.forEach((ans, idx) => {
        const q = quiz.questions.find(q => q._id.toString() === ans.questionId.toString());
        if (!q) {
            output.push(`Q${idx + 1}: Question not found! ID: ${ans.questionId}`);
            return;
        }

        const correctOpt = q.options.find(o => o.isCorrect);

        output.push(JSON.stringify({
            question: q.question,
            userSelected: ans.selectedAnswer,
            correctAnswer: correctOpt ? correctOpt.text : 'N/A',
            isMatch: ans.selectedAnswer === (correctOpt ? correctOpt.text : ''),
            backendIsCorrect: ans.isCorrect,
            userSelectedType: typeof ans.selectedAnswer,
            correctAnswerType: typeof (correctOpt ? correctOpt.text : undefined)
        }, null, 2));
    });

    fs.writeFileSync('debug_output.txt', output.join('\n'));
    process.exit();
};

debugFailure();
