// Streak Service - Handles streak logic and notifications
export class StreakService {
  constructor() {
    this.streakMilestones = [
      { days: 1, title: "First Day!", message: "🔥 Great start! You're on fire!", emoji: "🔥", color: "text-orange-500" },
      { days: 3, title: "3 Day Streak!", message: "🎯 3 days strong! You're building momentum!", emoji: "🎯", color: "text-blue-500" },
      { days: 7, title: "Week Warrior!", message: "🌟 Amazing! One week streak achieved!", emoji: "🌟", color: "text-purple-500" },
      { days: 14, title: "Two Week Champion!", message: "💪 Two weeks! You're unstoppable!", emoji: "💪", color: "text-green-500" },
      { days: 30, title: "Monthly Master!", message: "🏆 Incredible! One month streak!", emoji: "🏆", color: "text-yellow-500" },
      { days: 60, title: "Dedication Legend!", message: "🚀 Outstanding! Two months of dedication!", emoji: "🚀", color: "text-red-500" },
      { days: 100, title: "Century Streak!", message: "👑 Legendary! 100 days of excellence!", emoji: "👑", color: "text-indigo-500" },
      { days: 365, title: "Year of Excellence!", message: "🎊 PHENOMENAL! One year streak achieved!", emoji: "🎊", color: "text-pink-500" }
    ];

    this.dailyMessages = [
      "Keep the streak alive! 🔥",
      "You're doing amazing! 💪",
      "Consistency is key! ⭐",
      "Every day counts! 🌟",
      "You're building something great! 🚀",
      "Stay focused and keep going! 🎯",
      "Your dedication is inspiring! 💎",
      "One day at a time! 🌈",
      "Learning never stops! 📚",
      "You're on fire today! 🔥"
    ];
  }

  // Check if user achieved a new milestone
  checkMilestone(currentStreak, previousStreak = 0) {
    const newMilestone = this.streakMilestones.find(milestone => 
      currentStreak >= milestone.days && previousStreak < milestone.days
    );
    
    return newMilestone || null;
  }

  // Get daily motivation message
  getDailyMessage(streak) {
    if (streak === 0) {
      return "Start your learning journey today! Complete a lesson to begin your streak.";
    }
    
    // Check for milestone messages first
    const milestone = this.streakMilestones.find(m => m.days === streak);
    if (milestone) {
      return milestone.message;
    }
    
    // Return random daily message
    return this.dailyMessages[Math.floor(Math.random() * this.dailyMessages.length)];
  }

  // Get streak status and recommendations
  getStreakStatus(streak) {
    if (streak === 0) return {
      status: 'new',
      title: 'Start Your Journey',
      message: 'Complete your first lesson to begin your streak!',
      color: 'text-gray-500',
      icon: '🌱'
    };
    
    if (streak < 3) return {
      status: 'building',
      title: 'Building Momentum',
      message: 'Great start! Keep practicing daily.',
      color: 'text-orange-500',
      icon: '🔥'
    };
    
    if (streak < 7) return {
      status: 'growing',
      title: 'Growing Strong',
      message: 'You\'re developing a great habit!',
      color: 'text-blue-500',
      icon: '🎯'
    };
    
    if (streak < 14) return {
      status: 'consistent',
      title: 'Consistent Learner',
      message: 'Excellent dedication! Keep it up!',
      color: 'text-purple-500',
      icon: '🌟'
    };
    
    if (streak < 30) return {
      status: 'advanced',
      title: 'Advanced Streak',
      message: 'Outstanding commitment! You\'re inspiring!',
      color: 'text-green-500',
      icon: '💪'
    };
    
    if (streak < 100) return {
      status: 'expert',
      title: 'Expert Streak',
      message: 'Incredible dedication! You\'re a learning master!',
      color: 'text-yellow-500',
      icon: '🏆'
    };
    
    return {
      status: 'legendary',
      title: 'Legendary Streak',
      message: 'You\'re a learning legend! Truly remarkable!',
      color: 'text-indigo-500',
      icon: '👑'
    };
  }

  // Get next milestone
  getNextMilestone(currentStreak) {
    const milestones = this.streakMilestones.map(m => m.days);
    return milestones.find(milestone => milestone > currentStreak) || 365;
  }

  // Calculate streak progress percentage
  getStreakProgress(currentStreak) {
    const nextMilestone = this.getNextMilestone(currentStreak);
    return Math.min(100, (currentStreak / nextMilestone) * 100);
  }

  // Get streak tips based on current streak
  getStreakTip(streak) {
    if (streak === 0) return "Start your learning journey today! Complete a lesson to begin your streak.";
    if (streak < 3) return "Great start! Try to practice every day to build a strong habit.";
    if (streak < 7) return "You're building momentum! Keep going to reach your first week.";
    if (streak < 14) return "Excellent progress! You're developing a consistent learning routine.";
    if (streak < 30) return "Outstanding dedication! You're on your way to becoming a learning master.";
    if (streak < 100) return "Incredible commitment! You're an inspiration to other learners.";
    return "You're a learning legend! Your consistency is truly remarkable.";
  }

  // Get streak rewards (for gamification)
  getStreakRewards(streak) {
    const rewards = [];
    
    if (streak >= 1) rewards.push({ type: 'xp', amount: 10, message: 'First day bonus!' });
    if (streak >= 3) rewards.push({ type: 'badge', name: 'Getting Started', message: '3 day streak badge!' });
    if (streak >= 7) rewards.push({ type: 'xp', amount: 50, message: 'Week streak bonus!' });
    if (streak >= 14) rewards.push({ type: 'badge', name: 'Consistent', message: 'Two week badge!' });
    if (streak >= 30) rewards.push({ type: 'xp', amount: 200, message: 'Monthly streak bonus!' });
    if (streak >= 60) rewards.push({ type: 'badge', name: 'Dedicated', message: 'Two month badge!' });
    if (streak >= 100) rewards.push({ type: 'xp', amount: 1000, message: 'Century streak bonus!' });
    if (streak >= 365) rewards.push({ type: 'badge', name: 'Legendary', message: 'Year streak badge!' });
    
    return rewards;
  }

  // Check if streak is at risk (not practiced for 2+ days)
  isStreakAtRisk(lastPracticeDate) {
    if (!lastPracticeDate) return true;
    
    const today = new Date();
    const lastPractice = new Date(lastPracticeDate);
    const daysSinceLastPractice = Math.floor((today - lastPractice) / (1000 * 60 * 60 * 24));
    
    return daysSinceLastPractice >= 2;
  }

  // Get streak recovery message
  getStreakRecoveryMessage(daysSinceLastPractice) {
    if (daysSinceLastPractice === 1) {
      return "Don't worry! You can still maintain your streak by practicing today! 🔥";
    } else if (daysSinceLastPractice === 2) {
      return "Your streak is at risk! Practice today to keep it alive! ⚡";
    } else {
      return "Time to start a new streak! Every journey begins with a single step! 🌱";
    }
  }

  // Format streak display
  formatStreakDisplay(streak) {
    if (streak === 0) return "0 days";
    if (streak === 1) return "1 day";
    if (streak < 30) return `${streak} days`;
    if (streak < 365) {
      const months = Math.floor(streak / 30);
      const days = streak % 30;
      return `${months} month${months > 1 ? 's' : ''}${days > 0 ? ` ${days} day${days > 1 ? 's' : ''}` : ''}`;
    }
    
    const years = Math.floor(streak / 365);
    const days = streak % 365;
    return `${years} year${years > 1 ? 's' : ''}${days > 0 ? ` ${days} day${days > 1 ? 's' : ''}` : ''}`;
  }
}

// Create singleton instance
export const streakService = new StreakService();