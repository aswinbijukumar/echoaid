import mongoose from 'mongoose';
import Skill from './models/Skill.js';
import User from './models/User.js';
import UserSkillProgress from './models/UserSkillProgress.js';

// Debug completion and unlocking
async function testCompletionDebug() {
  try {
    console.log('🔍 Debugging Completion and Unlocking...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid');
    console.log('✅ Connected to database');

    // Get a test user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    console.log(`👤 Testing with user: ${user.name}`);

    // Get Level 0 skills
    const level0Skills = await Skill.find({ level: 0, isActive: true }).sort({ order: 1 });
    console.log(`📚 Found ${level0Skills.length} Level 0 skills:`);
    level0Skills.forEach(skill => {
      console.log(`  - Order ${skill.order}: ${skill.title} (ID: ${skill._id})`);
    });

    // Get user progress
    let userProgress = await UserSkillProgress.findOne({ user: user._id });
    if (!userProgress) {
      console.log('❌ No user progress found');
      return;
    }

    console.log('\n🔍 Current User Progress:');
    console.log(`Total skills in progress: ${userProgress.skills?.length || 0}`);
    userProgress.skills?.forEach(skill => {
      console.log(`  - Skill ID: ${skill.skill}, Completed: ${skill.isCompleted}, Level: ${skill.level}`);
    });

    // Test the unlocking logic for each skill
    console.log('\n🔓 Testing Unlock Logic:');
    for (const skill of level0Skills) {
      const completedSkillIds = userProgress.skills
        ?.filter(sp => sp.isCompleted)
        ?.map(sp => sp.skill.toString()) || [];
      
      console.log(`\n📋 Skill: ${skill.title} (Order: ${skill.order})`);
      console.log(`  - Completed skill IDs: ${completedSkillIds}`);
      console.log(`  - This skill ID: ${skill._id}`);
      console.log(`  - Is this skill completed: ${completedSkillIds.includes(skill._id.toString())}`);
      
      // Check if should be unlocked
      if (skill.order === 1 && skill.level === 0) {
        console.log(`  - ✅ Should be unlocked (first in level)`);
      } else {
        const previousSkill = level0Skills.find(s => s.order === skill.order - 1);
        if (previousSkill) {
          const isPreviousCompleted = completedSkillIds.includes(previousSkill._id.toString());
          console.log(`  - Previous skill (${previousSkill.title}) completed: ${isPreviousCompleted}`);
          if (isPreviousCompleted) {
            console.log(`  - ✅ Should be unlocked (previous completed)`);
          } else {
            console.log(`  - ❌ Should be locked (previous not completed)`);
          }
        }
      }
    }

    console.log('\n✅ Debug Complete!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the debug
testCompletionDebug();