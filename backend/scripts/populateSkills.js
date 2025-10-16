import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Skill from '../models/Skill.js';
import Sign from '../models/Sign.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const populateSkills = async () => {
  try {
    console.log('Starting skills population...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Get some signs for skills
    const signs = await Sign.find().limit(50);
    if (signs.length === 0) {
      console.error('No signs found. Please populate signs first.');
      process.exit(1);
    }

    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Cleared existing skills');

    // Create Skills
    const skills = [
      // Basics Category
      {
        title: "Hello & Goodbye",
        description: "Learn basic greetings and farewells",
        category: "basics",
        order: 1,
        signs: [signs[0]?._id, signs[1]?._id].filter(Boolean),
        targetSign: signs[0]?._id,
        xpReward: 20,
        createdBy: adminUser._id
      },
      {
        title: "Please & Thank You",
        description: "Essential polite expressions",
        category: "basics",
        order: 2,
        signs: [signs[2]?._id, signs[3]?._id].filter(Boolean),
        targetSign: signs[2]?._id,
        xpReward: 20,
        createdBy: adminUser._id
      },
      {
        title: "Yes & No",
        description: "Basic affirmation and negation",
        category: "basics",
        order: 3,
        signs: [signs[4]?._id, signs[5]?._id].filter(Boolean),
        targetSign: signs[4]?._id,
        xpReward: 20,
        createdBy: adminUser._id
      },

      // Alphabet Category
      {
        title: "Letters A-M",
        description: "First half of the alphabet",
        category: "alphabet",
        order: 1,
        signs: signs.slice(6, 19).map(s => s._id),
        targetSign: signs[6]?._id,
        xpReward: 30,
        createdBy: adminUser._id
      },
      {
        title: "Letters N-Z",
        description: "Second half of the alphabet",
        category: "alphabet",
        order: 2,
        signs: signs.slice(19, 32).map(s => s._id),
        targetSign: signs[19]?._id,
        xpReward: 30,
        createdBy: adminUser._id
      },
      {
        title: "Numbers 1-10",
        description: "Basic counting",
        category: "alphabet",
        order: 3,
        signs: signs.slice(32, 42).map(s => s._id),
        targetSign: signs[32]?._id,
        xpReward: 25,
        createdBy: adminUser._id
      },

      // Phrases Category
      {
        title: "Greetings",
        description: "Common greeting phrases",
        category: "phrases",
        order: 1,
        signs: signs.slice(42, 45).map(s => s._id),
        targetSign: signs[42]?._id,
        xpReward: 25,
        createdBy: adminUser._id
      },
      {
        title: "Questions",
        description: "Basic question words",
        category: "phrases",
        order: 2,
        signs: signs.slice(45, 48).map(s => s._id),
        targetSign: signs[45]?._id,
        xpReward: 25,
        createdBy: adminUser._id
      },

      // Family Category
      {
        title: "Family Members",
        description: "Signs for family relationships",
        category: "family",
        order: 1,
        signs: signs.slice(48, 52).map(s => s._id),
        targetSign: signs[48]?._id,
        xpReward: 25,
        createdBy: adminUser._id
      },

      // Activities Category
      {
        title: "Daily Activities",
        description: "Common daily activities",
        category: "activities",
        order: 1,
        signs: signs.slice(52, 56).map(s => s._id),
        targetSign: signs[52]?._id,
        xpReward: 25,
        createdBy: adminUser._id
      },

      // Advanced Category
      {
        title: "Complex Conversations",
        description: "Advanced conversation skills",
        category: "advanced",
        order: 1,
        signs: signs.slice(56, 60).map(s => s._id),
        targetSign: signs[56]?._id,
        xpReward: 35,
        createdBy: adminUser._id
      }
    ];

    // Create skills
    const createdSkills = [];
    for (const skillData of skills) {
      const skill = new Skill(skillData);
      await skill.save();
      createdSkills.push(skill);
      console.log(`Created skill: ${skill.title}`);
    }

    console.log('Skills population completed successfully!');
    console.log(`Created ${createdSkills.length} skills`);

  } catch (error) {
    console.error('Error populating skills:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the population
populateSkills();