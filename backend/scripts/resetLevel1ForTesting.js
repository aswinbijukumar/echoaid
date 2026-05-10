import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import UserSkillProgress from '../models/UserSkillProgress.js';
import Skill from '../models/Skill.js';

dotenv.config({ path: './config.env' });

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
console.log('Connected to MongoDB');

// Find user by partial email match
const user = await User.findOne({ email: { $regex: /bijukumar/i } });
if (!user) {
  console.log('❌ User not found');
  process.exit(1);
}
console.log(`👤 Found user: ${user.name} (${user.email})`);

// ── 1. Reset Level 1 skills to not completed ──────────────────────────────
const level1Skills = await Skill.find({ level: 1, isActive: true }).select('_id').lean();
const level1SkillIds = level1Skills.map(s => s._id.toString());

const progress = await UserSkillProgress.findOne({ user: user._id });
if (progress) {
  let resetCount = 0;
  progress.skills.forEach(sp => {
    if (level1SkillIds.includes(sp.skill.toString())) {
      sp.isCompleted = false;
      sp.isRelearning = false;
      sp.completedAt = null;
      resetCount++;
    }
  });
  await progress.save();
  console.log(`✅ Reset ${resetCount} Level 1 skill(s) to not completed`);
} else {
  console.log('⚠️  No UserSkillProgress found for this user');
}

// ── 2. Delete Level 1 quiz attempts ───────────────────────────────────────
const level1Quiz = await Quiz.findOne({ tags: { $in: ['level-1'] }, isActive: true });
if (level1Quiz) {
  const deleted = await QuizAttempt.deleteMany({ userId: user._id, quizId: level1Quiz._id });
  console.log(`✅ Deleted ${deleted.deletedCount} Level 1 quiz attempt(s)`);
} else {
  console.log('⚠️  No Level 1 quiz found');
}

// ── 3. Delete Level 1 certificates ───────────────────────────────────────
const deletedCerts = await Certificate.deleteMany({
  user: user._id,
  title: { $in: ['Level 1 Mastery'] },
  type: 'level_mastery'
});
console.log(`✅ Deleted ${deletedCerts.deletedCount} Level 1 certificate(s)`);

await mongoose.disconnect();
console.log('\nDone — Level 1 is fully reset. Level 0 quiz pass will unlock it again.');
