import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Unit from '../models/Unit.js';
import Lesson from '../models/Lesson.js';
import Sign from '../models/Sign.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const populateCurriculum = async () => {
  try {
    console.log('Starting curriculum population...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Get some signs for lessons
    const signs = await Sign.find().limit(20);
    if (signs.length === 0) {
      console.error('No signs found. Please populate signs first.');
      process.exit(1);
    }

    // Create Units
    const units = [
      {
        title: "Basic Hand Signs",
        description: "Learn fundamental hand gestures and basic communication signs",
        level: "Beginner",
        order: 1,
        icon: "HandRaisedIcon",
        color: "bg-green-500",
        estimatedDuration: 30,
        xpReward: 100,
        createdBy: adminUser._id
      },
      {
        title: "Alphabet & Numbers",
        description: "Master ISL alphabet and counting from 1 to 10",
        level: "Beginner",
        order: 2,
        icon: "AcademicCapIcon",
        color: "bg-blue-500",
        estimatedDuration: 45,
        xpReward: 150,
        createdBy: adminUser._id
      },
      {
        title: "Common Phrases",
        description: "Essential everyday expressions and greetings",
        level: "Intermediate",
        order: 3,
        icon: "ChatBubbleLeftRightIcon",
        color: "bg-purple-500",
        estimatedDuration: 40,
        xpReward: 200,
        createdBy: adminUser._id
      },
      {
        title: "Family & Friends",
        description: "Signs for relationships and family members",
        level: "Intermediate",
        order: 4,
        icon: "UserCircleIcon",
        color: "bg-pink-500",
        estimatedDuration: 35,
        xpReward: 180,
        createdBy: adminUser._id
      },
      {
        title: "Daily Activities",
        description: "Routine activities and daily life signs",
        level: "Advanced",
        order: 5,
        icon: "BookOpenIcon",
        color: "bg-orange-500",
        estimatedDuration: 50,
        xpReward: 250,
        createdBy: adminUser._id
      }
    ];

    // Clear existing units and lessons
    await Unit.deleteMany({});
    await Lesson.deleteMany({});
    console.log('Cleared existing curriculum data');

    // Create units
    const createdUnits = [];
    for (const unitData of units) {
      const unit = new Unit(unitData);
      await unit.save();
      createdUnits.push(unit);
      console.log(`Created unit: ${unit.title}`);
    }

    // Create lessons for each unit
    const lessons = [
      // Unit 1: Basic Hand Signs
      {
        title: "Hello and Goodbye",
        description: "Learn basic greetings",
        unit: createdUnits[0]._id,
        order: 1,
        level: "Beginner",
        duration: 10,
        objectives: [
          "Learn to sign 'Hello'",
          "Learn to sign 'Goodbye'",
          "Practice greeting gestures"
        ],
        signs: [signs[0]?._id, signs[1]?._id].filter(Boolean),
        exercises: [
          {
            type: "sign-recognition",
            question: "What sign is this?",
            options: [
              { text: "Hello", isCorrect: true },
              { text: "Goodbye", isCorrect: false },
              { text: "Thank you", isCorrect: false }
            ],
            correctAnswer: "Hello",
            explanation: "This is the sign for 'Hello' - wave your hand",
            points: 10,
            targetSign: signs[0]?._id
          },
          {
            type: "sign-production",
            question: "Show the sign for 'Goodbye'",
            options: [],
            correctAnswer: "Goodbye",
            explanation: "Wave your hand outward",
            points: 15,
            targetSign: signs[1]?._id
          }
        ],
        xpReward: 20,
        createdBy: adminUser._id
      },
      {
        title: "Please and Thank You",
        description: "Essential polite expressions",
        unit: createdUnits[0]._id,
        order: 2,
        level: "Beginner",
        duration: 8,
        objectives: [
          "Learn to sign 'Please'",
          "Learn to sign 'Thank you'",
          "Understand politeness in sign language"
        ],
        signs: [signs[2]?._id, signs[3]?._id].filter(Boolean),
        exercises: [
          {
            type: "translation",
            question: "What does this sign mean?",
            options: [
              { text: "Please", isCorrect: true },
              { text: "Thank you", isCorrect: false },
              { text: "Sorry", isCorrect: false }
            ],
            correctAnswer: "Please",
            explanation: "This gesture means 'Please'",
            points: 10
          }
        ],
        xpReward: 15,
        createdBy: adminUser._id
      },

      // Unit 2: Alphabet & Numbers
      {
        title: "Letters A-M",
        description: "First half of the alphabet",
        unit: createdUnits[1]._id,
        order: 1,
        level: "Beginner",
        duration: 15,
        objectives: [
          "Learn letters A through M",
          "Practice finger spelling",
          "Recognize letter signs"
        ],
        signs: signs.slice(4, 17).map(s => s._id),
        exercises: [
          {
            type: "sign-recognition",
            question: "What letter is this?",
            options: [
              { text: "A", isCorrect: true },
              { text: "B", isCorrect: false },
              { text: "C", isCorrect: false }
            ],
            correctAnswer: "A",
            explanation: "This is the sign for letter 'A'",
            points: 10,
            targetSign: signs[4]?._id
          },
          {
            type: "matching",
            question: "Match the letters with their signs",
            options: [
              { text: "A", isCorrect: true },
              { text: "B", isCorrect: true },
              { text: "C", isCorrect: true }
            ],
            correctAnswer: "A",
            explanation: "Match each letter correctly",
            points: 15
          }
        ],
        xpReward: 25,
        createdBy: adminUser._id
      },

      // Unit 3: Common Phrases
      {
        title: "Greetings and Introductions",
        description: "Meeting people and introductions",
        unit: createdUnits[2]._id,
        order: 1,
        level: "Intermediate",
        duration: 12,
        objectives: [
          "Learn greeting phrases",
          "Practice introductions",
          "Understand conversation starters"
        ],
        signs: signs.slice(17, 20).map(s => s._id),
        exercises: [
          {
            type: "fill-blank",
            question: "Complete the phrase: 'Nice to ___ you'",
            options: [
              { text: "meet", isCorrect: true },
              { text: "see", isCorrect: false },
              { text: "know", isCorrect: false }
            ],
            correctAnswer: "meet",
            explanation: "The correct phrase is 'Nice to meet you'",
            points: 10
          }
        ],
        xpReward: 20,
        createdBy: adminUser._id
      }
    ];

    // Create lessons
    for (const lessonData of lessons) {
      const lesson = new Lesson(lessonData);
      await lesson.save();
      
      // Add lesson to unit
      const unit = await Unit.findById(lessonData.unit);
      unit.lessons.push(lesson._id);
      await unit.save();
      
      console.log(`Created lesson: ${lesson.title}`);
    }

    console.log('Curriculum population completed successfully!');
    console.log(`Created ${createdUnits.length} units and ${lessons.length} lessons`);

  } catch (error) {
    console.error('Error populating curriculum:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the population
populateCurriculum();