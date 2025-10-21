import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';

dotenv.config({ path: './config.env' });

async function testQuizEndpoint() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    // Test if we can find quizzes
    const quizzes = await Quiz.find({}).limit(1);
    console.log(`📊 Found ${quizzes.length} quizzes in database`);
    
    if (quizzes.length > 0) {
      const quiz = quizzes[0];
      console.log(`📝 Sample quiz: ${quiz.title} (ID: ${quiz._id})`);
      console.log(`📊 Questions: ${quiz.questions?.length || 0}`);
      console.log(`🏷️ Category: ${quiz.category}`);
      console.log(`🏷️ Tags: ${quiz.tags?.join(', ') || 'None'}`);
    }
    
    await mongoose.disconnect();
    console.log('✅ Database disconnected');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuizEndpoint();