import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Achievement from '../models/Achievement.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const achievements = [
  // Quiz Achievements
  {
    name: "First Steps",
    description: "Complete your first quiz",
    icon: "👶",
    category: "quiz",
    requirements: {
      type: "completion",
      value: 1
    },
    xpReward: 50,
    badge: "first-quiz",
    rarity: "common"
  },
  {
    name: "Quiz Master",
    description: "Complete 10 quizzes",
    icon: "🎯",
    category: "quiz",
    requirements: {
      type: "completion",
      value: 10
    },
    xpReward: 200,
    badge: "quiz-master",
    rarity: "uncommon"
  },
  {
    name: "Quiz Champion",
    description: "Complete 50 quizzes",
    icon: "🏆",
    category: "quiz",
    requirements: {
      type: "completion",
      value: 50
    },
    xpReward: 500,
    badge: "quiz-champion",
    rarity: "rare"
  },
  {
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    icon: "💯",
    category: "quiz",
    requirements: {
      type: "score",
      value: 100
    },
    xpReward: 100,
    badge: "perfect-score",
    rarity: "uncommon"
  },
  {
    name: "Speed Demon",
    description: "Complete a quiz in under 5 minutes",
    icon: "⚡",
    category: "speed",
    requirements: {
      type: "speed",
      value: 300 // 5 minutes in seconds
    },
    xpReward: 150,
    badge: "speed-demon",
    rarity: "rare"
  },

  // Streak Achievements
  {
    name: "Getting Started",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 3
    },
    xpReward: 100,
    badge: "getting-started",
    rarity: "common"
  },
  {
    name: "Consistent Learner",
    description: "Maintain a 7-day streak",
    icon: "🔥🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 7
    },
    xpReward: 250,
    badge: "consistent-learner",
    rarity: "uncommon"
  },
  {
    name: "Dedicated Student",
    description: "Maintain a 30-day streak",
    icon: "🔥🔥🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 30
    },
    xpReward: 1000,
    badge: "dedicated-student",
    rarity: "epic"
  },
  {
    name: "Unstoppable",
    description: "Maintain a 100-day streak",
    icon: "🔥🔥🔥🔥",
    category: "streak",
    requirements: {
      type: "streak",
      value: 100
    },
    xpReward: 5000,
    badge: "unstoppable",
    rarity: "legendary"
  },

  // Learning Achievements
  {
    name: "Alphabet Expert",
    description: "Master the alphabet category",
    icon: "🔤",
    category: "learning",
    requirements: {
      type: "xp",
      value: 1000,
      category: "alphabet"
    },
    xpReward: 300,
    badge: "alphabet-expert",
    rarity: "uncommon"
  },
  {
    name: "Phrase Master",
    description: "Master the phrases category",
    icon: "💬",
    category: "learning",
    requirements: {
      type: "xp",
      value: 1000,
      category: "phrases"
    },
    xpReward: 300,
    badge: "phrase-master",
    rarity: "uncommon"
  },
  {
    name: "Family Specialist",
    description: "Master the family category",
    icon: "👨‍👩‍👧‍👦",
    category: "learning",
    requirements: {
      type: "xp",
      value: 1000,
      category: "family"
    },
    xpReward: 300,
    badge: "family-specialist",
    rarity: "uncommon"
  },
  {
    name: "Activity Expert",
    description: "Master the activities category",
    icon: "🎮",
    category: "learning",
    requirements: {
      type: "xp",
      value: 1000,
      category: "activities"
    },
    xpReward: 300,
    badge: "activity-expert",
    rarity: "uncommon"
  },
  {
    name: "Advanced Scholar",
    description: "Master the advanced category",
    icon: "🎓",
    category: "learning",
    requirements: {
      type: "xp",
      value: 1000,
      category: "advanced"
    },
    xpReward: 500,
    badge: "advanced-scholar",
    rarity: "rare"
  },

  // Level Achievements
  {
    name: "Rising Star",
    description: "Reach level 5",
    icon: "⭐",
    category: "learning",
    requirements: {
      type: "level",
      value: 5
    },
    xpReward: 200,
    badge: "rising-star",
    rarity: "common"
  },
  {
    name: "Experienced Learner",
    description: "Reach level 10",
    icon: "🌟",
    category: "learning",
    requirements: {
      type: "level",
      value: 10
    },
    xpReward: 500,
    badge: "experienced-learner",
    rarity: "uncommon"
  },
  {
    name: "Expert",
    description: "Reach level 25",
    icon: "💫",
    category: "learning",
    requirements: {
      type: "level",
      value: 25
    },
    xpReward: 1000,
    badge: "expert",
    rarity: "rare"
  },
  {
    name: "Master",
    description: "Reach level 50",
    icon: "👑",
    category: "learning",
    requirements: {
      type: "level",
      value: 50
    },
    xpReward: 2500,
    badge: "master",
    rarity: "epic"
  },
  {
    name: "Legend",
    description: "Reach level 100",
    icon: "🏆",
    category: "learning",
    requirements: {
      type: "level",
      value: 100
    },
    xpReward: 10000,
    badge: "legend",
    rarity: "legendary"
  },

  // Special Achievements
  {
    name: "Weekend Warrior",
    description: "Complete 5 quizzes on weekends",
    icon: "⚔️",
    category: "social",
    requirements: {
      type: "completion",
      value: 5,
      timeframe: "weekly"
    },
    xpReward: 300,
    badge: "weekend-warrior",
    rarity: "rare"
  },
  {
    name: "Perfectionist",
    description: "Get 10 perfect scores",
    icon: "✨",
    category: "accuracy",
    requirements: {
      type: "score",
      value: 100
    },
    xpReward: 1000,
    badge: "perfectionist",
    rarity: "epic"
  },
  {
    name: "Marathon Runner",
    description: "Complete 5 quizzes in one day",
    icon: "🏃‍♂️",
    category: "social",
    requirements: {
      type: "completion",
      value: 5,
      timeframe: "daily"
    },
    xpReward: 500,
    badge: "marathon-runner",
    rarity: "rare"
  }
];

const seedAchievements = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Cleared existing achievements');

    // Insert new achievements
    await Achievement.insertMany(achievements);
    console.log(`Seeded ${achievements.length} achievements`);

    console.log('Achievement seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding achievements:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
seedAchievements();