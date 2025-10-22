// Test script to verify quiz update endpoint
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Quiz from './models/Quiz.js';
import User from './models/User.js';

const testQuizUpdate = async () => {
  try {
    console.log('🧪 Testing Quiz Update Endpoint...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid');
    console.log('✅ Connected to database');
    
    // Find a quiz to test with
    const quiz = await Quiz.findOne({ isActive: true });
    if (!quiz) {
      console.log('❌ No active quiz found to test with');
      return;
    }
    
    console.log(`📋 Found quiz: "${quiz.title}" (ID: ${quiz._id})`);
    
    // Find an admin user
    const adminUser = await User.findOne({ role: { $in: ['admin', 'admin'] } });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }
    
    console.log(`👤 Found admin user: ${adminUser.email} (ID: ${adminUser._id})`);
    
    // Test data for update
    const updateData = {
      title: quiz.title + ' (Updated)',
      description: quiz.description + ' - Updated for testing',
      timeLimit: quiz.timeLimit + 5
    };
    
    console.log('📝 Update data:', updateData);
    
    // Test the update directly in the database
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quiz._id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (updatedQuiz) {
      console.log('✅ Quiz update successful in database');
      console.log('📊 Updated quiz:', {
        title: updatedQuiz.title,
        description: updatedQuiz.description,
        timeLimit: updatedQuiz.timeLimit,
        updatedAt: updatedQuiz.updatedAt
      });
    } else {
      console.log('❌ Quiz update failed in database');
    }
    
    // Revert the changes
    await Quiz.findByIdAndUpdate(
      quiz._id,
      { 
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log('🔄 Reverted changes');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
testQuizUpdate();