import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Certificate from '../models/Certificate.js';

dotenv.config({ path: './config.env' });

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
console.log('Connected to MongoDB');

// Find Level 0 mastery quiz
const level0Quiz = await Quiz.findOne({
  tags: { $in: ['level-0'] },
  isActive: true
});

if (level0Quiz) {
  const deleted = await QuizAttempt.deleteMany({ quizId: level0Quiz._id });
  console.log(`✅ Deleted ${deleted.deletedCount} Level 0 quiz attempt(s) for all users`);
} else {
  console.log('⚠️  No Level 0 quiz found');
}

// Delete Level 0 certificates
const certTitles = ['Level 0 Mastery', 'Level 0 Basics'];
const deletedCerts = await Certificate.deleteMany({
  title: { $in: certTitles },
  type: 'level_mastery'
});
console.log(`✅ Deleted ${deletedCerts.deletedCount} Level 0 certificate(s)`);

await mongoose.disconnect();
console.log('Done — you can now retake the Level 0 quiz fresh.');
