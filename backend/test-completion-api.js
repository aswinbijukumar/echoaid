import mongoose from 'mongoose';
import Skill from './models/Skill.js';
import User from './models/User.js';
import UserSkillProgress from './models/UserSkillProgress.js';

// Test the completion API endpoint
async function testCompletionAPI() {
  try {
    console.log('🧪 Testing Completion API...\n');

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

    // Get the first skill
    const firstSkill = await Skill.findOne({ level: 0, order: 1, isActive: true });
    if (!firstSkill) {
      console.log('❌ No first skill found');
      return;
    }
    console.log(`📚 Testing with skill: ${firstSkill.title} (ID: ${firstSkill._id})`);

    // Simulate the completion API call
    const completionData = {
      score: 100,
      mistakes: 0,
      perfect: true,
      heartsUsed: 0
    };

    console.log('\n🔄 Simulating completion API call...');
    console.log('Completion data:', completionData);

    // Get user progress
    let userProgress = await UserSkillProgress.findOne({ user: user._id });
    if (!userProgress) {
      userProgress = new UserSkillProgress({ user: user._id });
      await userProgress.save();
      console.log('📝 Created new user progress record');
    }

    // Simulate the completion logic from skillController.js
    const xpEarned = Math.round(completionData.score * 0.1);
    console.log(`💰 XP earned: ${xpEarned}`);

    // Update user progress
    userProgress.hearts = Math.max(0, userProgress.hearts - completionData.heartsUsed);
    userProgress.daily.progress += xpEarned;
    userProgress.daily.lastActiveDate = new Date();
    userProgress.lastActiveDate = new Date();

    // Update skill progress
    const existingSkillIndex = userProgress.skills.findIndex(
      sp => sp.skill.toString() === firstSkill._id.toString()
    );

    if (existingSkillIndex >= 0) {
      const skillProgress = userProgress.skills[existingSkillIndex];
      skillProgress.attempts += 1;
      skillProgress.correctAnswers += (completionData.perfect ? 1 : 0);
      skillProgress.totalXP += xpEarned;
      skillProgress.lastPracticed = new Date();
      
      // Mark as completed immediately when user finishes the module
      if (!skillProgress.isCompleted) {
        skillProgress.isCompleted = true;
        skillProgress.completedAt = new Date();
        skillProgress.level = 1; // Set to level 1 when completed
        console.log('✅ Marked skill as completed');
      } else {
        console.log('✅ Skill already completed');
      }
      
      // Update streak
      if (completionData.perfect) {
        skillProgress.streak += 1;
      } else {
        skillProgress.streak = 0;
      }
    } else {
      userProgress.skills.push({
        skill: firstSkill._id,
        level: 1,
        isCompleted: true, // Mark as completed immediately
        isUnlocked: true,
        completedAt: new Date(), // Set completion date
        lastPracticed: new Date(),
        totalXP: xpEarned,
        attempts: 1,
        correctAnswers: completionData.perfect ? 1 : 0,
        streak: completionData.perfect ? 1 : 0
      });
      console.log('✅ Added new completed skill');
    }

    await userProgress.save();
    console.log('💾 Saved user progress');

    // Check the result
    const updatedProgress = await UserSkillProgress.findOne({ user: user._id });
    console.log('\n📊 Updated Progress:');
    console.log(`Completed skills: ${updatedProgress.skills?.filter(s => s.isCompleted).length || 0}`);
    updatedProgress.skills?.forEach(skill => {
      console.log(`  - Skill: ${skill.skill}, Completed: ${skill.isCompleted}, Level: ${skill.level}`);
    });

    console.log('\n✅ Completion API Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
testCompletionAPI();