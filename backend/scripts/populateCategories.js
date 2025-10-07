import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const populateCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the first admin user to use as creator
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Default categories
    const defaultCategories = [
      {
        name: 'Alphabet',
        slug: 'alphabet',
        description: 'Basic alphabet signs for learning letters',
        icon: 'AcademicCapIcon',
        color: 'bg-blue-500',
        order: 1
      },
      {
        name: 'Numbers',
        slug: 'numbers',
        description: 'Number signs for counting and mathematics',
        icon: 'AcademicCapIcon',
        color: 'bg-teal-500',
        order: 2
      },
      {
        name: 'Phrases',
        slug: 'phrases',
        description: 'Common phrases and expressions',
        icon: 'ChatBubbleLeftRightIcon',
        color: 'bg-purple-500',
        order: 3
      },
      {
        name: 'Family',
        slug: 'family',
        description: 'Family member and relationship signs',
        icon: 'UserCircleIcon',
        color: 'bg-pink-500',
        order: 4
      },
      {
        name: 'Activities',
        slug: 'activities',
        description: 'Daily activities and actions',
        icon: 'BookOpenIcon',
        color: 'bg-orange-500',
        order: 5
      },
      {
        name: 'Advanced',
        slug: 'advanced',
        description: 'Advanced and complex signs',
        icon: 'PuzzlePieceIcon',
        color: 'bg-red-500',
        order: 6
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of defaultCategories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({ slug: categoryData.slug });
      
      if (existingCategory) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create category
      const category = await Category.create({
        ...categoryData,
        createdBy: adminUser._id
      });

      console.log(`Created category: ${category.name} (${category.slug})`);
      createdCount++;
    }

    console.log(`\n✅ Category population completed!`);
    console.log(`📊 Created: ${createdCount} categories`);
    console.log(`⏭️  Skipped: ${skippedCount} existing categories`);

  } catch (error) {
    console.error('Error populating categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
populateCategories();