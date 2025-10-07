import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createSampleQuiz = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid');
    console.log('Connected to MongoDB');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Create sample quiz
    const sampleQuiz = new Quiz({
      title: 'Basic Sign Language Alphabet',
      description: 'Test your knowledge of the sign language alphabet with this beginner-friendly quiz.',
      category: 'alphabet',
      difficulty: 'Beginner',
      timeLimit: 5,
      passingScore: 70,
      maxAttempts: 3,
      isActive: true,
      createdBy: adminUser._id,
      questions: [
        {
          question: 'What is the sign for the letter "A"?',
          options: [
            { text: 'Closed fist with thumb up', isCorrect: true },
            { text: 'Open palm facing forward', isCorrect: false },
            { text: 'Index finger pointing up', isCorrect: false },
            { text: 'Two fingers crossed', isCorrect: false }
          ],
          correctAnswer: 'Closed fist with thumb up',
          points: 10,
          explanation: 'The letter "A" in sign language is represented by a closed fist with the thumb up.'
        },
        {
          question: 'How do you sign the letter "B"?',
          options: [
            { text: 'Closed fist', isCorrect: false },
            { text: 'Open palm with fingers together', isCorrect: true },
            { text: 'Index finger pointing', isCorrect: false },
            { text: 'Thumb and pinky extended', isCorrect: false }
          ],
          correctAnswer: 'Open palm with fingers together',
          points: 10,
          explanation: 'The letter "B" is signed with an open palm and all fingers together.'
        },
        {
          question: 'What is the sign for "Hello"?',
          options: [
            { text: 'Wave hand', isCorrect: true },
            { text: 'Closed fist', isCorrect: false },
            { text: 'Open palm', isCorrect: false },
            { text: 'Two fingers up', isCorrect: false }
          ],
          correctAnswer: 'Wave hand',
          points: 15,
          explanation: 'Hello is typically signed with a wave motion of the hand.'
        },
        {
          question: 'How do you sign "Thank you"?',
          options: [
            { text: 'Thumbs up', isCorrect: false },
            { text: 'Hand to chin and down', isCorrect: true },
            { text: 'Clapping hands', isCorrect: false },
            { text: 'Pointing to yourself', isCorrect: false }
          ],
          correctAnswer: 'Hand to chin and down',
          points: 15,
          explanation: 'Thank you is signed by bringing your hand to your chin and moving it down.'
        },
        {
          question: 'What is the sign for "Goodbye"?',
          options: [
            { text: 'Wave hand', isCorrect: true },
            { text: 'Closed fist', isCorrect: false },
            { text: 'Open palm', isCorrect: false },
            { text: 'Thumbs up', isCorrect: false }
          ],
          correctAnswer: 'Wave hand',
          points: 10,
          explanation: 'Goodbye is signed with a wave motion, similar to hello.'
        }
      ],
      tags: ['alphabet', 'beginner', 'basic'],
      stats: {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0
      }
    });

    await sampleQuiz.save();
    console.log('Sample quiz created successfully:', sampleQuiz.title);
    console.log('Quiz ID:', sampleQuiz._id);

  } catch (error) {
    console.error('Error creating sample quiz:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleQuiz();