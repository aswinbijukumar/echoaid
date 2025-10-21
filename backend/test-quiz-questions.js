import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';

// Test quiz questions to see image paths
async function testQuizQuestions() {
  try {
    console.log('🔍 Testing Quiz Questions...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid');
    console.log('✅ Connected to database');

    // Get the Level 0 quiz
    const quiz = await Quiz.findOne({ title: /Level 0/ });
    if (!quiz) {
      console.log('❌ No Level 0 quiz found');
      return;
    }

    console.log(`📝 Quiz: ${quiz.title}`);
    console.log(`❓ Questions: ${quiz.questions.length}\n`);

    // Check each question
    quiz.questions.forEach((question, index) => {
      console.log(`\n📋 Question ${index + 1}:`);
      console.log(`  Question: ${question.question}`);
      console.log(`  Type: ${question.type}`);
      console.log(`  Media URL: ${question.mediaUrl || 'None'}`);
      console.log(`  Correct Answer: ${question.correctAnswer}`);
      console.log(`  Options:`);
      question.options.forEach((option, optIndex) => {
        console.log(`    ${optIndex + 1}. ${option.text} (Correct: ${option.isCorrect})`);
      });
    });

    console.log('\n✅ Quiz Questions Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testQuizQuestions();