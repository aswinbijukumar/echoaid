import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Skill from '../models/Skill.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample learning modules data
const sampleModules = [
  // Level 0 - Beginner Modules
  {
    title: "Basic Greetings",
    description: "Learn essential greeting words and phrases",
    category: "basics",
    level: 0,
    order: 1,
    xpReward: 20,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Hello",
        meaning: "A friendly greeting",
        imagePath: "/assets/signs/phrases/hello.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Goodbye",
        meaning: "A farewell greeting",
        imagePath: "/assets/signs/phrases/goodbye.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Thank you",
        meaning: "Expression of gratitude",
        imagePath: "/assets/signs/phrases/thankyou.png",
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "image-to-word",
        question: "What does this sign mean?",
        correctAnswer: "Hello",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        imagePath: "/assets/signs/phrases/hello.png"
      }
    ]
  },
  {
    title: "Family Members",
    description: "Learn to sign family relationships",
    category: "family",
    level: 0,
    order: 2,
    xpReward: 25,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Mother",
        meaning: "Female parent",
        imagePath: "/assets/signs/family/mother.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Father",
        meaning: "Male parent",
        imagePath: "/assets/signs/family/father.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Brother",
        meaning: "Male sibling",
        imagePath: "/assets/signs/family/brother.png",
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "Select the sign for 'Mother'",
        correctAnswer: "Mother",
        options: ["Mother", "Father", "Brother", "Sister"],
        imagePath: "/assets/signs/family/mother.png"
      }
    ]
  },
  {
    title: "Numbers 1-5",
    description: "Learn to count from 1 to 5",
    category: "numbers",
    level: 0,
    order: 3,
    xpReward: 20,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "1",
        meaning: "Number one",
        imagePath: "/assets/signs/numbers/1.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "2",
        meaning: "Number two",
        imagePath: "/assets/signs/numbers/2.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "3",
        meaning: "Number three",
        imagePath: "/assets/signs/numbers/3.png",
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "image-to-word",
        question: "What number is this?",
        correctAnswer: "3",
        options: ["1", "2", "3", "4"],
        imagePath: "/assets/signs/numbers/3.png"
      }
    ]
  },

  // Level 1 - Intermediate Modules
  {
    title: "Daily Activities",
    description: "Learn common daily activities and routines",
    category: "activities",
    level: 1,
    order: 1,
    xpReward: 30,
    isActive: true,
    moduleType: "mixed",
    flashcards: [
      {
        word: "Eat",
        meaning: "To consume food",
        imagePath: "/assets/signs/activities/eat.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Sleep",
        meaning: "To rest in bed",
        imagePath: "/assets/signs/activities/sleep.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Work",
        meaning: "To perform job duties",
        imagePath: "/assets/signs/activities/work.png",
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "Which sign means 'Eat'?",
        correctAnswer: "Eat",
        options: ["Eat", "Sleep", "Work", "Play"],
        imagePath: "/assets/signs/activities/eat.png"
      },
      {
        questionType: "image-to-word",
        question: "What activity is this?",
        correctAnswer: "Sleep",
        options: ["Eat", "Sleep", "Work", "Play"],
        imagePath: "/assets/signs/activities/sleep.png"
      }
    ]
  },
  {
    title: "Letters A-E",
    description: "Learn the first five letters of the alphabet",
    category: "alphabet",
    level: 1,
    order: 2,
    xpReward: 35,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "A",
        meaning: "Letter A",
        imagePath: "/assets/signs/alphabet/A.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "B",
        meaning: "Letter B",
        imagePath: "/assets/signs/alphabet/B.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "C",
        meaning: "Letter C",
        imagePath: "/assets/signs/alphabet/C.png",
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "image-to-word",
        question: "What letter is this?",
        correctAnswer: "A",
        options: ["A", "B", "C", "D"],
        imagePath: "/assets/signs/alphabet/A.png"
      }
    ]
  },

  // Level 2 - Advanced Modules
  {
    title: "Common Phrases",
    description: "Learn useful everyday phrases",
    category: "phrases",
    level: 2,
    order: 1,
    xpReward: 40,
    isActive: true,
    moduleType: "mixed",
    flashcards: [
      {
        word: "How are you?",
        meaning: "A question asking about someone's well-being",
        imagePath: "/assets/signs/phrases/how_are_you.png",
        videoPath: "/assets/videos/phrases/how_are_you.mp4",
        audioPath: ""
      },
      {
        word: "Nice to meet you",
        meaning: "A polite greeting when meeting someone new",
        imagePath: "/assets/signs/phrases/nice_to_meet_you.png",
        videoPath: "/assets/videos/phrases/nice_to_meet_you.mp4",
        audioPath: ""
      },
      {
        word: "Excuse me",
        meaning: "A polite way to get someone's attention",
        imagePath: "/assets/signs/phrases/excuse_me.png",
        videoPath: "/assets/videos/phrases/excuse_me.mp4",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "Which phrase means 'How are you?'?",
        correctAnswer: "How are you?",
        options: ["How are you?", "Nice to meet you", "Excuse me", "Thank you"],
        imagePath: "/assets/signs/phrases/how_are_you.png",
        videoPath: "/assets/videos/phrases/how_are_you.mp4"
      }
    ]
  },
  {
    title: "Numbers 6-10",
    description: "Learn to count from 6 to 10",
    category: "numbers",
    level: 2,
    order: 2,
    xpReward: 35,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "6",
        meaning: "Number six",
        imagePath: "/assets/signs/numbers/6.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "7",
        meaning: "Number seven",
        imagePath: "/assets/signs/numbers/7.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "8",
        meaning: "Number eight",
        imagePath: "/assets/signs/numbers/8.png",
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "image-to-word",
        question: "What number is this?",
        correctAnswer: "7",
        options: ["6", "7", "8", "9"],
        imagePath: "/assets/signs/numbers/7.png"
      }
    ]
  },

  // Level 3 - Expert Modules
  {
    title: "Advanced Conversations",
    description: "Learn complex conversation starters and responses",
    category: "advanced",
    level: 3,
    order: 1,
    xpReward: 50,
    isActive: true,
    moduleType: "quiz",
    flashcards: [],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "How do you sign 'What is your name?'?",
        correctAnswer: "What is your name?",
        options: ["What is your name?", "How are you?", "Where are you from?", "Nice to meet you"],
        imagePath: "/assets/signs/advanced/what_is_your_name.png",
        videoPath: "/assets/videos/advanced/what_is_your_name.mp4"
      },
      {
        questionType: "image-to-word",
        question: "What does this sign mean?",
        correctAnswer: "Where are you from?",
        options: ["What is your name?", "How are you?", "Where are you from?", "Nice to meet you"],
        imagePath: "/assets/signs/advanced/where_are_you_from.png",
        videoPath: "/assets/videos/advanced/where_are_you_from.mp4"
      }
    ]
  },
  {
    title: "Complete Alphabet",
    description: "Master all 26 letters of the alphabet",
    category: "alphabet",
    level: 3,
    order: 2,
    xpReward: 60,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "X",
        meaning: "Letter X",
        imagePath: "/assets/signs/alphabet/X.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Y",
        meaning: "Letter Y",
        imagePath: "/assets/signs/alphabet/Y.png",
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Z",
        meaning: "Letter Z",
        imagePath: "/assets/signs/alphabet/Z.png",
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "image-to-word",
        question: "What is the last letter of the alphabet?",
        correctAnswer: "Z",
        options: ["X", "Y", "Z", "W"],
        imagePath: "/assets/signs/alphabet/Z.png"
      }
    ]
  }
];

async function populateModules() {
  try {
    console.log('Starting to populate learning modules...');
    
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: { $in: ['admin', 'admin'] } });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing sample modules (optional - remove this if you want to keep existing data)
    // await Skill.deleteMany({ title: { $in: sampleModules.map(m => m.title) } });
    
    let createdCount = 0;
    let skippedCount = 0;

    for (const moduleData of sampleModules) {
      // Check if module already exists
      const existingModule = await Skill.findOne({ title: moduleData.title });
      
      if (existingModule) {
        console.log(`Module "${moduleData.title}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create new module
      const newModule = new Skill({
        ...moduleData,
        createdBy: adminUser._id
      });

      await newModule.save();
      console.log(`✅ Created module: "${moduleData.title}" (Level ${moduleData.level})`);
      createdCount++;
    }

    console.log('\n📊 Population Summary:');
    console.log(`✅ Created: ${createdCount} modules`);
    console.log(`⏭️  Skipped: ${skippedCount} modules (already exist)`);
    console.log(`📚 Total modules in database: ${await Skill.countDocuments()}`);
    
    // Show modules by level
    const modulesByLevel = await Skill.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📈 Modules by Level:');
    modulesByLevel.forEach(level => {
      console.log(`   Level ${level._id}: ${level.count} modules`);
    });

  } catch (error) {
    console.error('Error populating modules:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the population script
populateModules();