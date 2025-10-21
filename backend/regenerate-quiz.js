import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import User from './models/User.js';
import { generateLevelQuiz } from './services/quizGenerator.js';

// Regenerate Level 0 quiz with fixes
async function regenerateQuiz() {
  try {
    console.log('🔄 Regenerating Level 0 Quiz...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid');
    console.log('✅ Connected to database');

    // Get an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    // Delete existing Level 0 quiz
    const deletedQuiz = await Quiz.findOneAndDelete({ title: /Level 0/ });
    if (deletedQuiz) {
      console.log('🗑️ Deleted existing Level 0 quiz');
    }

    // Generate new quiz
    console.log('🎯 Generating new Level 0 quiz...');
    const newQuiz = await generateLevelQuiz(0, adminUser._id);
    console.log('✅ New quiz generated successfully!');
    console.log(`📝 Quiz: ${newQuiz.title}`);
    console.log(`❓ Questions: ${newQuiz.questions.length}`);

    // Test a few questions
    console.log('\n🔍 Sample Questions:');
    newQuiz.questions.slice(0, 3).forEach((question, index) => {
      console.log(`\n📋 Question ${index + 1}:`);
      console.log(`  Question: ${question.question}`);
      console.log(`  Media URL: ${question.mediaUrl || 'None'}`);
      console.log(`  Correct Answer: ${question.correctAnswer}`);
      console.log(`  Options: ${question.options.map(opt => opt.text).join(', ')}`);
    });

    console.log('\n✅ Quiz Regeneration Complete!');

  } catch (error) {
    console.error('❌ Regeneration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the regeneration
regenerateQuiz();