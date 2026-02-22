
import path from 'path';

const models = [
    'User.js', 'Quiz.js', 'Sign.js', 'Lesson.js', 'Unit.js',
    'Skill.js', 'Category.js', 'QuestionBank.js', 'Achievement.js',
    'UserProgress.js', 'PracticeAttempt.js', 'QuizAttempt.js',
    'Exercise.js', 'LearningPath.js', 'Message.js', 'AuditLog.js', 'Video.js'
];

async function testModels() {
    console.log('🔍 Testing Model Imports Verbose...');

    for (const file of models) {
        process.stdout.write(`Testing ${file}... `);
        try {
            await import(`./models/${file}`);
            console.log('✅ OK');
        } catch (error) {
            console.log('❌ FAIL');
            console.error(`Error loading ${file}:`, error.message);
            // console.error(error); // Don't print full stack to avoid buffer garbage for now
        }
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

testModels();
