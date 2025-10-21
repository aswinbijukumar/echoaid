import mongoose from 'mongoose';
import Skill from './models/Skill.js';
import User from './models/User.js';
import UserSkillProgress from './models/UserSkillProgress.js';

// Test module completion logic
async function testModuleCompletion() {
  try {
    console.log('🧪 Testing Module Completion Logic...\n');

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
    console.log(`📚 Found ${level0Skills.length} Level 0 skills`);

    if (level0Skills.length === 0) {
      console.log('❌ No Level 0 skills found');
      return;
    }

    // Get user progress
    let userProgress = await UserSkillProgress.findOne({ user: user._id });
    if (!userProgress) {
      userProgress = new UserSkillProgress({ user: user._id });
      await userProgress.save();
      console.log('📝 Created new user progress record');
    }

    console.log('\n🔍 Current User Progress:');
    console.log(`Completed skills: ${userProgress.skills?.filter(s => s.isCompleted).length || 0}`);
    console.log(`Total skills in progress: ${userProgress.skills?.length || 0}`);

    // Test completing the first skill
    const firstSkill = level0Skills[0];
    console.log(`\n🎯 Testing completion of: ${firstSkill.title} (Order: ${firstSkill.order})`);

    // Simulate completion
    const existingSkillIndex = userProgress.skills.findIndex(
      sp => sp.skill.toString() === firstSkill._id.toString()
    );

    if (existingSkillIndex >= 0) {
      const skillProgress = userProgress.skills[existingSkillIndex];
      console.log(`📊 Current progress: Level ${skillProgress.level}, Completed: ${skillProgress.isCompleted}`);
      
      // Mark as completed
      skillProgress.isCompleted = true;
      skillProgress.completedAt = new Date();
      skillProgress.level = 1;
      skillProgress.lastPracticed = new Date();
      
      console.log(`✅ Marked as completed: Level ${skillProgress.level}, Completed: ${skillProgress.isCompleted}`);
    } else {
      userProgress.skills.push({
        skill: firstSkill._id,
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

    // Check unlocking logic for next skill
    if (level0Skills.length > 1) {
      const secondSkill = level0Skills[1];
      console.log(`\n🔓 Testing unlock for: ${secondSkill.title} (Order: ${secondSkill.order})`);
      
      // Check if second skill should be unlocked
      const completedSkillIds = userProgress.skills
        ?.filter(sp => sp.isCompleted)
        ?.map(sp => sp.skill.toString()) || [];
      
      console.log(`Completed skill IDs: ${completedSkillIds}`);
      
      // First skill in Level 0 should always be unlocked
      if (secondSkill.order === 1 && secondSkill.level === 0) {
        console.log('✅ Second skill should be unlocked (first in level)');
      } else {
        // Check if previous skill is completed
        const previousSkill = level0Skills.find(s => s.order === secondSkill.order - 1);
        if (previousSkill) {
          const isPreviousCompleted = completedSkillIds.includes(previousSkill._id.toString());
          console.log(`Previous skill (${previousSkill.title}) completed: ${isPreviousCompleted}`);
          if (isPreviousCompleted) {
            console.log('✅ Second skill should be unlocked (previous completed)');
          } else {
            console.log('❌ Second skill should be locked (previous not completed)');
          }
        }
      }
    }

    // Refresh user progress
    const updatedProgress = await UserSkillProgress.findOne({ user: user._id });
    console.log('\n📊 Updated Progress:');
    console.log(`Completed skills: ${updatedProgress.skills?.filter(s => s.isCompleted).length || 0}`);
    updatedProgress.skills?.forEach(skill => {
      console.log(`  - Skill: ${skill.skill}, Completed: ${skill.isCompleted}, Level: ${skill.level}`);
    });

    console.log('\n✅ Module Completion Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testModuleCompletion();