import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Skill from '../models/Skill.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const populateSkillsSimple = async () => {
  try {
    console.log('Starting simple skills population...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found, creating a test admin...');
      const testAdmin = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isEmailVerified: true
      });
      await testAdmin.save();
      console.log('Test admin created');
    }

    const creator = adminUser || await User.findOne({ role: 'admin' });

    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Cleared existing skills');

    // Create simple skills for testing
    const skills = [
      {
        title: "Hello & Goodbye",
        description: "Learn basic greetings and farewells",
        category: "basics",
        order: 1,
        xpReward: 20,
        createdBy: creator._id
      },
      {
        title: "Please & Thank You",
        description: "Essential polite expressions",
        category: "basics",
        order: 2,
        xpReward: 20,
        createdBy: creator._id
      },
      {
        title: "Letters A-M",
        description: "First half of the alphabet",
        category: "alphabet",
        order: 1,
        xpReward: 30,
        createdBy: creator._id
      },
      {
        title: "Letters N-Z",
        description: "Second half of the alphabet",
        category: "alphabet",
        order: 2,
        xpReward: 30,
        createdBy: creator._id
      },
      {
        title: "Numbers 1-10",
        description: "Basic counting",
        category: "alphabet",
        order: 3,
        xpReward: 25,
        createdBy: creator._id
      },
      {
        title: "Family Members",
        description: "Signs for family relationships",
        category: "family",
        order: 1,
        xpReward: 25,
        createdBy: creator._id
      },
      {
        title: "Daily Activities",
        description: "Common daily activities",
        category: "activities",
        order: 1,
        xpReward: 25,
        createdBy: creator._id
      }
    ];

    // Create skills
    for (const skillData of skills) {
      const skill = new Skill(skillData);
      await skill.save();
      console.log(`Created skill: ${skill.title}`);
    }

    console.log('Skills population completed successfully!');
    console.log(`Created ${skills.length} skills`);

  } catch (error) {
    console.error('Error populating skills:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB Disconnected');
  }
};

// Run the population
populateSkillsSimple();