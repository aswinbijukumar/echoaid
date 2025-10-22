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

// Comprehensive Level 0-6 modules for testing
const levelModules = [
  // Level 0 - Beginner (4 modules)
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
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Goodbye",
        meaning: "A farewell greeting",
        imagePath: "/assets/signs/phrases/goodbye.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Thank you",
        meaning: "Expression of gratitude",
        imagePath: "/assets/signs/phrases/thankyou.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
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
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Father",
        meaning: "Male parent",
        imagePath: "/assets/signs/family/father.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Brother",
        meaning: "Male sibling",
        imagePath: "/assets/signs/family/brother.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
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
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "2",
        meaning: "Number two",
        imagePath: "/assets/signs/numbers/2.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "3",
        meaning: "Number three",
        imagePath: "/assets/signs/numbers/3.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },
  {
    title: "Basic Questions",
    description: "Learn simple question words",
    category: "basics",
    level: 0,
    order: 4,
    xpReward: 25,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "What",
        meaning: "Question word for things",
        imagePath: "/assets/signs/basics/what.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Where",
        meaning: "Question word for places",
        imagePath: "/assets/signs/basics/where.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Who",
        meaning: "Question word for people",
        imagePath: "/assets/signs/basics/who.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },

  // Level 1 - Intermediate (3 modules)
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
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Sleep",
        meaning: "To rest in bed",
        imagePath: "/assets/signs/activities/sleep.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Work",
        meaning: "To perform job duties",
        imagePath: "/assets/signs/activities/work.png",
        additionalImages: [],
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
        imagePath: "/assets/signs/activities/eat.png",
        videoPath: ""
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
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "B",
        meaning: "Letter B",
        imagePath: "/assets/signs/alphabet/B.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "C",
        meaning: "Letter C",
        imagePath: "/assets/signs/alphabet/C.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },
  {
    title: "Colors",
    description: "Learn basic colors in sign language",
    category: "basics",
    level: 1,
    order: 3,
    xpReward: 30,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Red",
        meaning: "The color red",
        imagePath: "/assets/signs/colors/red.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Blue",
        meaning: "The color blue",
        imagePath: "/assets/signs/colors/blue.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Green",
        meaning: "The color green",
        imagePath: "/assets/signs/colors/green.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },

  // Level 2 - Advanced (3 modules)
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
        additionalImages: [],
        videoPath: "/assets/videos/phrases/how_are_you.mp4",
        audioPath: ""
      },
      {
        word: "Nice to meet you",
        meaning: "A polite greeting when meeting someone new",
        imagePath: "/assets/signs/phrases/nice_to_meet_you.png",
        additionalImages: [],
        videoPath: "/assets/videos/phrases/nice_to_meet_you.mp4",
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
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "7",
        meaning: "Number seven",
        imagePath: "/assets/signs/numbers/7.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "8",
        meaning: "Number eight",
        imagePath: "/assets/signs/numbers/8.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },
  {
    title: "Time Concepts",
    description: "Learn to express time in sign language",
    category: "basics",
    level: 2,
    order: 3,
    xpReward: 40,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Morning",
        meaning: "Early part of the day",
        imagePath: "/assets/signs/time/morning.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Afternoon",
        meaning: "Middle part of the day",
        imagePath: "/assets/signs/time/afternoon.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Evening",
        meaning: "Late part of the day",
        imagePath: "/assets/signs/time/evening.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },

  // Level 3 - Expert (3 modules)
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
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Y",
        meaning: "Letter Y",
        imagePath: "/assets/signs/alphabet/Y.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Z",
        meaning: "Letter Z",
        imagePath: "/assets/signs/alphabet/Z.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },
  {
    title: "Emotions",
    description: "Learn to express emotions in sign language",
    category: "basics",
    level: 3,
    order: 3,
    xpReward: 50,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Happy",
        meaning: "Feeling joy or pleasure",
        imagePath: "/assets/signs/emotions/happy.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Sad",
        meaning: "Feeling sorrow or unhappiness",
        imagePath: "/assets/signs/emotions/sad.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Angry",
        meaning: "Feeling strong displeasure",
        imagePath: "/assets/signs/emotions/angry.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },

  // Level 4 - Master (3 modules)
  {
    title: "Professional Terms",
    description: "Learn professional and business sign language",
    category: "advanced",
    level: 4,
    order: 1,
    xpReward: 60,
    isActive: true,
    moduleType: "mixed",
    flashcards: [
      {
        word: "Meeting",
        meaning: "A gathering for discussion",
        imagePath: "/assets/signs/professional/meeting.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Project",
        meaning: "A planned undertaking",
        imagePath: "/assets/signs/professional/project.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "How do you sign 'business meeting'?",
        correctAnswer: "Business meeting",
        options: ["Business meeting", "Conference call", "Presentation", "Interview"],
        imagePath: "/assets/signs/professional/business_meeting.png",
        videoPath: "/assets/videos/professional/business_meeting.mp4"
      }
    ]
  },
  {
    title: "Medical Terms",
    description: "Learn medical and health-related signs",
    category: "advanced",
    level: 4,
    order: 2,
    xpReward: 65,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Doctor",
        meaning: "Medical professional",
        imagePath: "/assets/signs/medical/doctor.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Hospital",
        meaning: "Medical facility",
        imagePath: "/assets/signs/medical/hospital.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Medicine",
        meaning: "Medical treatment",
        imagePath: "/assets/signs/medical/medicine.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },
  {
    title: "Technology Terms",
    description: "Learn technology-related sign language",
    category: "advanced",
    level: 4,
    order: 3,
    xpReward: 60,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Computer",
        meaning: "Electronic device for computing",
        imagePath: "/assets/signs/technology/computer.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Internet",
        meaning: "Global computer network",
        imagePath: "/assets/signs/technology/internet.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Phone",
        meaning: "Communication device",
        imagePath: "/assets/signs/technology/phone.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },

  // Level 5 - Grandmaster (3 modules)
  {
    title: "Academic Language",
    description: "Learn academic and scholarly sign language",
    category: "advanced",
    level: 5,
    order: 1,
    xpReward: 70,
    isActive: true,
    moduleType: "mixed",
    flashcards: [
      {
        word: "Research",
        meaning: "Systematic investigation",
        imagePath: "/assets/signs/academic/research.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Study",
        meaning: "Learning process",
        imagePath: "/assets/signs/academic/study.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "How do you sign 'hypothesis'?",
        correctAnswer: "Hypothesis",
        options: ["Hypothesis", "Theory", "Conclusion", "Analysis"],
        imagePath: "/assets/signs/academic/hypothesis.png",
        videoPath: "/assets/videos/academic/hypothesis.mp4"
      }
    ]
  },
  {
    title: "Legal Terms",
    description: "Learn legal and law-related signs",
    category: "advanced",
    level: 5,
    order: 2,
    xpReward: 75,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Law",
        meaning: "System of rules",
        imagePath: "/assets/signs/legal/law.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Court",
        meaning: "Legal institution",
        imagePath: "/assets/signs/legal/court.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Judge",
        meaning: "Legal official",
        imagePath: "/assets/signs/legal/judge.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },
  {
    title: "Scientific Terms",
    description: "Learn scientific and technical signs",
    category: "advanced",
    level: 5,
    order: 3,
    xpReward: 70,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Experiment",
        meaning: "Scientific test",
        imagePath: "/assets/signs/scientific/experiment.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Theory",
        meaning: "Scientific explanation",
        imagePath: "/assets/signs/scientific/theory.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Data",
        meaning: "Information for analysis",
        imagePath: "/assets/signs/scientific/data.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },

  // Level 6 - Legendary (3 modules)
  {
    title: "Philosophical Concepts",
    description: "Learn philosophical and abstract concepts",
    category: "advanced",
    level: 6,
    order: 1,
    xpReward: 80,
    isActive: true,
    moduleType: "quiz",
    flashcards: [],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "How do you sign 'philosophical concept'?",
        correctAnswer: "Philosophical concept",
        options: ["Philosophical concept", "Abstract idea", "Complex theory", "Deep thought"],
        imagePath: "/assets/signs/philosophy/philosophy.png",
        videoPath: "/assets/videos/philosophy/philosophy.mp4"
      },
      {
        questionType: "image-to-word",
        question: "What does this philosophical sign represent?",
        correctAnswer: "Universal truth",
        options: ["Universal truth", "Absolute knowledge", "Eternal wisdom", "Infinite understanding"],
        imagePath: "/assets/signs/philosophy/universal_truth.png",
        videoPath: "/assets/videos/philosophy/universal_truth.mp4"
      }
    ]
  },
  {
    title: "Artistic Expression",
    description: "Learn artistic and creative sign language",
    category: "advanced",
    level: 6,
    order: 2,
    xpReward: 85,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Art",
        meaning: "Creative expression",
        imagePath: "/assets/signs/art/art.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Music",
        meaning: "Auditory art form",
        imagePath: "/assets/signs/art/music.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Dance",
        meaning: "Movement art form",
        imagePath: "/assets/signs/art/dance.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  },
  {
    title: "Cultural Heritage",
    description: "Learn cultural and heritage-related signs",
    category: "advanced",
    level: 6,
    order: 3,
    xpReward: 80,
    isActive: true,
    moduleType: "flashcards",
    flashcards: [
      {
        word: "Tradition",
        meaning: "Cultural practice",
        imagePath: "/assets/signs/culture/tradition.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Heritage",
        meaning: "Cultural inheritance",
        imagePath: "/assets/signs/culture/heritage.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      },
      {
        word: "Community",
        meaning: "Group of people",
        imagePath: "/assets/signs/culture/community.png",
        additionalImages: [],
        videoPath: "",
        audioPath: ""
      }
    ],
    quizQuestions: []
  }
];

async function createLevelModules() {
  try {
    console.log('Creating comprehensive Level 0-6 modules...');
    
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: { $in: ['admin', 'admin'] } });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing modules (optional - remove this if you want to keep existing data)
    console.log('Clearing existing modules...');
    await Skill.deleteMany({});
    console.log('Existing modules cleared.');

    let createdCount = 0;

    for (const moduleData of levelModules) {
      // Create new module
      const newModule = new Skill({
        ...moduleData,
        createdBy: adminUser._id
      });

      await newModule.save();
      console.log(`✅ Created module: "${moduleData.title}" (Level ${moduleData.level})`);
      createdCount++;
    }

    console.log('\n📊 Level 0-6 Modules Summary:');
    console.log(`✅ Created: ${createdCount} modules`);
    
    // Show modules by level
    const modulesByLevel = await Skill.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📈 Modules by Level:');
    modulesByLevel.forEach(level => {
      console.log(`   Level ${level._id}: ${level.count} modules`);
    });

    console.log('\n🎯 Sequential Level Progression:');
    console.log('   Level 0: 4 modules (Always unlocked)');
    console.log('   Level 1: 3 modules (Unlock after completing ALL Level 0)');
    console.log('   Level 2: 3 modules (Unlock after completing ALL Level 1)');
    console.log('   Level 3: 3 modules (Unlock after completing ALL Level 2)');
    console.log('   Level 4: 3 modules (Unlock after completing ALL Level 3)');
    console.log('   Level 5: 3 modules (Unlock after completing ALL Level 4)');
    console.log('   Level 6: 3 modules (Unlock after completing ALL Level 5)');
    console.log('\n💡 Total: 22 modules across 7 levels (0-6)');

  } catch (error) {
    console.error('Error creating level modules:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
createLevelModules();