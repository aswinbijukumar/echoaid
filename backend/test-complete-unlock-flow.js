import mongoose from 'mongoose';
import Skill from './models/Skill.js';
import User from './models/User.js';
import UserSkillProgress from './models/UserSkillProgress.js';

// Test the complete unlock flow
async function testCompleteUnlockFlow() {
  try {
    console.log('🧪 Testing Complete Unlock Flow...\n');

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

    // Get Level 0 skills in order
    const level0Skills = await Skill.find({ level: 0, isActive: true }).sort({ order: 1 });
    console.log(`📚 Found ${level0Skills.length} Level 0 skills:`);
    level0Skills.forEach(skill => {
      console.log(`  - Order ${skill.order}: ${skill.title}`);
    });

    if (level0Skills.length === 0) {
      console.log('❌ No Level 0 skills found');
      return;
    }

    // Get or create user progress
    let userProgress = await UserSkillProgress.findOne({ user: user._id });
    if (!userProgress) {
      userProgress = new UserSkillProgress({ user: user._id });
      await userProgress.save();
      console.log('📝 Created new user progress record');
    }

    console.log('\n🔍 Initial State:');
    console.log(`Completed skills: ${userProgress.skills?.filter(s => s.isCompleted).length || 0}`);
    console.log(`Total skills in progress: ${userProgress.skills?.length || 0}`);

    // Test completing skills one by one
    for (let i = 0; i < Math.min(3, level0Skills.length); i++) {
      const skill = level0Skills[i];
      console.log(`\n🎯 Step ${i + 1}: Completing "${skill.title}" (Order: ${skill.order})`);

      // Check if skill is already completed
      const existingSkillIndex = userProgress.skills.findIndex(
        sp => sp.skill.toString() === skill._id.toString()
      );

      if (existingSkillIndex >= 0) {
        const skillProgress = userProgress.skills[existingSkillIndex];
        console.log(`📊 Current progress: Level ${skillProgress.level}, Completed: ${skillProgress.isCompleted}`);
        
        if (!skillProgress.isCompleted) {
          // Mark as completed
          skillProgress.isCompleted = true;
          skillProgress.completedAt = new Date();
          skillProgress.level = 1;
          skillProgress.lastPracticed = new Date();
          console.log(`✅ Marked as completed`);
        } else {
          console.log(`✅ Already completed`);
        }
      } else {
        // Add new completed skill
        userProgress.skills.push({
          skill: skill._id,
          level: 1,
          isCompleted: true,
          isUnlocked: true,
          completedAt: new Date(),
          lastPracticed: new Date(),
          totalXP: 100,
          attempts: 1,
          correctAnswers: 1,
          streak: 1
        });
        console.log('✅ Added new completed skill');
      }

      await userProgress.save();
      console.log('💾 Saved user progress');

      // Check what should be unlocked next
      if (i < level0Skills.length - 1) {
        const nextSkill = level0Skills[i + 1];
        console.log(`\n🔓 Checking unlock for: "${nextSkill.title}" (Order: ${nextSkill.order})`);
        
        // Get completed skill IDs
        const completedSkillIds = userProgress.skills
          ?.filter(sp => sp.isCompleted)
          ?.map(sp => sp.skill.toString()) || [];
        
        console.log(`Completed skill IDs: ${completedSkillIds}`);
        
        // Check if next skill should be unlocked
        if (nextSkill.order === 1 && nextSkill.level === 0) {
          console.log('✅ Next skill should be unlocked (first in level)');
        } else {
          // Check if previous skill is completed
          const previousSkill = level0Skills.find(s => s.order === nextSkill.order - 1);
          if (previousSkill) {
            const isPreviousCompleted = completedSkillIds.includes(previousSkill._id.toString());
            console.log(`Previous skill (${previousSkill.title}) completed: ${isPreviousCompleted}`);
            if (isPreviousCompleted) {
              console.log('✅ Next skill should be unlocked (previous completed)');
            } else {
              console.log('❌ Next skill should be locked (previous not completed)');
            }
          }
        }
      }
    }

    // Final state check
    const finalProgress = await UserSkillProgress.findOne({ user: user._id });
    console.log('\n📊 Final State:');
    console.log(`Completed skills: ${finalProgress.skills?.filter(s => s.isCompleted).length || 0}`);
    finalProgress.skills?.forEach(skill => {
      console.log(`  - Skill: ${skill.skill}, Completed: ${skill.isCompleted}, Level: ${skill.level}`);
    });

    console.log('\n✅ Complete Unlock Flow Test Complete!');
    console.log('\n📋 Summary:');
    console.log('- Skills should unlock sequentially (1→2→3)');
    console.log('- Each completed skill should unlock the next one');
    console.log('- Level 0 skills should unlock based on order completion');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testCompleteUnlockFlow();