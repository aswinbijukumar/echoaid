// Test script to verify Level 1 Mastery Quiz locking logic
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Quiz from './models/Quiz.js';
import Skill from './models/Skill.js';
import UserSkillProgress from './models/UserSkillProgress.js';

const testLevel1QuizLock = async () => {
  try {
    console.log('🧪 Testing Level 1 Mastery Quiz Lock Logic...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid');
    console.log('✅ Connected to database');
    
    // Find Level 1 Mastery Quiz
    const level1Quiz = await Quiz.findOne({ 
      title: { $regex: /Level 1.*Mastery Quiz/i } 
    });
    
    if (!level1Quiz) {
      console.log('❌ No Level 1 Mastery Quiz found');
      return;
    }
    
    console.log(`📋 Found Level 1 Mastery Quiz: "${level1Quiz.title}"`);
    
    // Get all skills in Level 0 and Level 1
    const level0Skills = await Skill.find({ level: 0, isActive: true }).sort({ order: 1 });
    const level1Skills = await Skill.find({ level: 1, isActive: true }).sort({ order: 1 });
    
    console.log(`📚 Level 0 Skills: ${level0Skills.length}`);
    console.log(`📚 Level 1 Skills: ${level1Skills.length}`);
    
    // Test with a sample user (you can replace with actual user ID)
    const testUserId = '507f1f77bcf86cd799439011'; // Replace with actual user ID
    
    // Get user progress
    const userProgress = await UserSkillProgress.findOne({ user: testUserId });
    
    if (!userProgress) {
      console.log('❌ No user progress found for test user');
      return;
    }
    
    console.log(`👤 Testing with user: ${testUserId}`);
    
    // Check Level 0 completion
    const completedLevel0Skills = level0Skills.filter(skill => 
      userProgress.skills.some(sp => 
        sp.skill.toString() === skill._id.toString() && sp.isCompleted
      )
    );
    
    // Check Level 1 completion
    const completedLevel1Skills = level1Skills.filter(skill => 
      userProgress.skills.some(sp => 
        sp.skill.toString() === skill._id.toString() && sp.isCompleted
      )
    );
    
    console.log(`📊 Level 0 completed: ${completedLevel0Skills.length}/${level0Skills.length}`);
    console.log(`📊 Level 1 completed: ${completedLevel1Skills.length}/${level1Skills.length}`);
    
    // Check if Level 1 Mastery Quiz should be unlocked
    const level0Completed = completedLevel0Skills.length === level0Skills.length;
    const level1Completed = completedLevel1Skills.length === level1Skills.length;
    const shouldBeUnlocked = level0Completed && level1Completed;
    
    console.log(`🔓 Level 0 completed: ${level0Completed}`);
    console.log(`🔓 Level 1 completed: ${level1Completed}`);
    console.log(`🔓 Level 1 Mastery Quiz should be unlocked: ${shouldBeUnlocked}`);
    
    if (shouldBeUnlocked) {
      console.log('✅ Level 1 Mastery Quiz is properly unlocked!');
    } else {
      console.log('🔒 Level 1 Mastery Quiz is properly locked!');
      if (!level0Completed) {
        console.log('   - Complete all Level 0 modules first');
      }
      if (!level1Completed) {
        console.log('   - Complete all Level 1 modules first');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
testLevel1QuizLock();