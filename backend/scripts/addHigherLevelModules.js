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

// Higher level modules for testing dynamic levels
const higherLevelModules = [
  // Level 4 - Master Level
  {
    title: "Complex Conversations",
    description: "Master advanced conversation skills and complex sentence structures",
    category: "advanced",
    level: 4,
    order: 1,
    xpReward: 60,
    isActive: true,
    moduleType: "mixed",
    flashcards: [
      {
        word: "What is your profession?",
        meaning: "Asking about someone's job or career",
        imagePath: "/assets/signs/advanced/profession.png",
        additionalImages: [],
        videoPath: "/assets/videos/advanced/profession.mp4",
        audioPath: ""
      },
      {
        word: "I work as a teacher",
        meaning: "Stating your profession",
        imagePath: "/assets/signs/advanced/teacher.png",
        additionalImages: [],
        videoPath: "/assets/videos/advanced/teacher.mp4",
        audioPath: ""
      }
    ],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "How do you sign 'What is your profession?'?",
        correctAnswer: "What is your profession?",
        options: ["What is your profession?", "Where do you work?", "How are you?", "Nice to meet you"],
        imagePath: "/assets/signs/advanced/profession.png",
        videoPath: "/assets/videos/advanced/profession.mp4"
      }
    ]
  },
  
  // Level 7 - Mythic Level
  {
    title: "Professional Sign Language",
    description: "Learn professional and business sign language terminology",
    category: "advanced",
    level: 7,
    order: 1,
    xpReward: 80,
    isActive: true,
    moduleType: "quiz",
    flashcards: [],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "How do you sign 'business meeting'?",
        correctAnswer: "Business meeting",
        options: ["Business meeting", "Conference call", "Presentation", "Interview"],
        imagePath: "/assets/signs/professional/business_meeting.png",
        videoPath: "/assets/videos/professional/business_meeting.mp4"
      },
      {
        questionType: "image-to-word",
        question: "What does this professional sign mean?",
        correctAnswer: "Project deadline",
        options: ["Project deadline", "Budget approval", "Team meeting", "Client presentation"],
        imagePath: "/assets/signs/professional/project_deadline.png",
        videoPath: "/assets/videos/professional/project_deadline.mp4"
      }
    ]
  },

  // Level 10 - Ultimate Level
  {
    title: "Academic Sign Language",
    description: "Master academic and scholarly sign language for higher education",
    category: "advanced",
    level: 10,
    order: 1,
    xpReward: 100,
    isActive: true,
    moduleType: "mixed",
    flashcards: [
      {
        word: "Research methodology",
        meaning: "The systematic approach to conducting research",
        imagePath: "/assets/signs/academic/methodology.png",
        additionalImages: [],
        videoPath: "/assets/videos/academic/methodology.mp4",
        audioPath: ""
      },
      {
        word: "Statistical analysis",
        meaning: "The process of analyzing data using statistical methods",
        imagePath: "/assets/signs/academic/statistics.png",
        additionalImages: [],
        videoPath: "/assets/videos/academic/statistics.mp4",
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

  // Level 15 - Universal Level
  {
    title: "Universal Sign Language",
    description: "Master the most advanced and universal sign language concepts",
    category: "advanced",
    level: 15,
    order: 1,
    xpReward: 150,
    isActive: true,
    moduleType: "quiz",
    flashcards: [],
    quizQuestions: [
      {
        questionType: "word-to-image",
        question: "How do you sign 'philosophical concept'?",
        correctAnswer: "Philosophical concept",
        options: ["Philosophical concept", "Abstract idea", "Complex theory", "Deep thought"],
        imagePath: "/assets/signs/universal/philosophy.png",
        videoPath: "/assets/videos/universal/philosophy.mp4"
      },
      {
        questionType: "image-to-word",
        question: "What does this universal sign represent?",
        correctAnswer: "Cosmic understanding",
        options: ["Cosmic understanding", "Universal truth", "Infinite wisdom", "Eternal knowledge"],
        imagePath: "/assets/signs/universal/cosmic.png",
        videoPath: "/assets/videos/universal/cosmic.mp4"
      }
    ]
  }
];

async function addHigherLevelModules() {
  try {
    console.log('Adding higher level modules for testing dynamic levels...');
    
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const moduleData of higherLevelModules) {
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

    console.log('\n📊 Higher Level Modules Summary:');
    console.log(`✅ Created: ${createdCount} modules`);
    console.log(`⏭️  Skipped: ${skippedCount} modules (already exist)`);
    
    // Show modules by level
    const modulesByLevel = await Skill.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📈 All Modules by Level:');
    modulesByLevel.forEach(level => {
      console.log(`   Level ${level._id}: ${level.count} modules`);
    });

    console.log('\n🎯 Dynamic Level System Test:');
    console.log('   - Admin can now create modules at any level (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, etc.)');
    console.log('   - Users must complete ALL modules in Level 0 to unlock Level 1');
    console.log('   - Users must complete ALL modules in Level 1 to unlock Level 2');
    console.log('   - And so on for unlimited levels...');

  } catch (error) {
    console.error('Error adding higher level modules:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
addHigherLevelModules();