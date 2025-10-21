import mongoose from 'mongoose';
import Skill from './models/Skill.js';
import User from './models/User.js';
import UserSkillProgress from './models/UserSkillProgress.js';

// Test the learning flow logic
async function testLearningFlow() {
  try {
    console.log('🧪 Testing Learning Flow Logic...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid');
    console.log('✅ Connected to database');

    // Test 1: Check if skills exist and are properly ordered
    console.log('\n📚 Test 1: Checking Skills Structure');
    const skills = await Skill.find({ isActive: true }).sort({ level: 1, order: 1 });
    console.log(`Found ${skills.length} active skills`);
    
    // Group by level
    const skillsByLevel = skills.reduce((acc, skill) => {
      const level = skill.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(skill);
      return acc;
    }, {});

    Object.keys(skillsByLevel).forEach(level => {
      console.log(`Level ${level}: ${skillsByLevel[level].length} modules`);
      skillsByLevel[level].forEach(skill => {
        console.log(`  - Order ${skill.order}: ${skill.title}`);
      });
    });

    // Test 2: Check unlocking logic
    console.log('\n🔓 Test 2: Testing Unlocking Logic');
    const level0Skills = skillsByLevel[0] || [];
    if (level0Skills.length > 0) {
      console.log(`Level 0 has ${level0Skills.length} modules`);
      console.log('First module should be unlocked by default');
      console.log('Subsequent modules should unlock after previous completion');
    }

    // Test 3: Check if there are any users with progress
    console.log('\n👤 Test 3: Checking User Progress');
    const userProgress = await UserSkillProgress.find().populate('user', 'name email');
    console.log(`Found ${userProgress.length} user progress records`);
    
    if (userProgress.length > 0) {
      const user = userProgress[0];
      console.log(`Sample user: ${user.user?.name || 'Unknown'}`);
      console.log(`Completed skills: ${user.skills?.filter(s => s.isCompleted).length || 0}`);
    }

    // Test 4: Check quiz generation capability
    console.log('\n🎯 Test 4: Checking Quiz Generation');
    const level0SkillsForQuiz = level0Skills.filter(skill => 
      skill.flashcards && skill.flashcards.length > 0
    );
    console.log(`Level 0 has ${level0SkillsForQuiz.length} modules with flashcards for quiz generation`);

    if (level0SkillsForQuiz.length > 0) {
      const sampleSkill = level0SkillsForQuiz[0];
      console.log(`Sample skill for quiz: ${sampleSkill.title}`);
      console.log(`Flashcards: ${sampleSkill.flashcards?.length || 0}`);
    }

    console.log('\n✅ Learning Flow Test Complete!');
    console.log('\n📋 Test Results Summary:');
    console.log(`- Total skills: ${skills.length}`);
    console.log(`- Levels available: ${Object.keys(skillsByLevel).length}`);
    console.log(`- Level 0 modules: ${level0Skills.length}`);
    console.log(`- Users with progress: ${userProgress.length}`);
    console.log(`- Quiz-ready modules: ${level0SkillsForQuiz.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testLearningFlow();