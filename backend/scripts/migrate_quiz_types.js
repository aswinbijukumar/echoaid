
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config.env') });

import Quiz from '../models/Quiz.js';

const migrateQuizzes = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        // 1. Update all quizzes that missing quizType to 'standard'
        console.log('🔄 Updating legacy quizzes to "standard"...');
        const result = await Quiz.updateMany(
            { quizType: { $exists: false } }, // Only update if field is missing
            {
                $set: {
                    quizType: 'standard',
                    level: 1
                }
            }
        );
        console.log(`✨ Updated ${result.modifiedCount} quizzes to standard type.`);

        // 2. Find or Create Level 1 Mastery Quiz
        console.log('🔍 Checking for Level 1 Mastery Quiz...');
        let masteryQuiz = await Quiz.findOne({
            $or: [
                { title: 'Level 1 Mastery Quiz' },
                { quizType: 'mastery', level: 1 }
            ]
        });

        if (masteryQuiz) {
            console.log('📝 Updating existing Mastery Quiz...');
            masteryQuiz.quizType = 'mastery';
            masteryQuiz.level = 1;
            masteryQuiz.title = 'Level 1 Mastery Quiz'; // Ensure naming consistency
            masteryQuiz.category = 'mixed'; // Mastery covers all
            await masteryQuiz.save();
            console.log('✅ Level 1 Mastery Quiz updated.');
        } else {
            console.log('🆕 Creating new Level 1 Mastery Quiz...');
            // Need to mock some questions if creating from scratch
            await Quiz.create({
                title: 'Level 1 Mastery Quiz',
                description: 'Prove your mastery of Level 1 signs to earn your certificate!',
                category: 'mixed',
                difficulty: 'Beginner',
                quizType: 'mastery',
                level: 1,
                timeLimit: 15,
                passingScore: 80,
                maxAttempts: 3,
                questions: [
                    {
                        question: 'What is the sign for "Hello"?',
                        type: 'multiple-choice',
                        options: [
                            { text: 'Wave', isCorrect: true },
                            { text: 'Fist', isCorrect: false },
                            { text: 'Point', isCorrect: false },
                            { text: 'Clap', isCorrect: false }
                        ],
                        correctAnswer: 'Wave', // Legacy field support
                        points: 10
                    }
                ]
            });
            console.log('✅ Level 1 Mastery Quiz created.');
        }

        console.log('🎉 Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateQuizzes();
