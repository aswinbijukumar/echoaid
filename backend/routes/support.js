import express from 'express';
import { protect, adminAndSuperAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Mock data for support tickets
let supportTickets = [
  {
    id: 1,
    subject: 'Cannot access lesson videos',
    message: 'I\'m having trouble playing the video lessons. The videos keep buffering and never load completely.',
    user: 'user@example.com',
    priority: 'high',
    status: 'open',
    createdAt: new Date('2024-01-28'),
    category: 'technical'
  },
  {
    id: 2,
    subject: 'Quiz scoring issue',
    message: 'The quiz results are not being saved correctly. I completed the alphabet quiz but it shows 0% score.',
    user: 'student@example.com',
    priority: 'medium',
    status: 'open',
    createdAt: new Date('2024-01-29'),
    category: 'content'
  },
  {
    id: 3,
    subject: 'Account verification problem',
    message: 'I registered but never received the verification email. Can you help me verify my account?',
    user: 'newuser@example.com',
    priority: 'low',
    status: 'replied',
    reply: 'We\'ve sent a new verification email. Please check your spam folder as well.',
    createdAt: new Date('2024-01-27'),
    category: 'account'
  }
];

// Forum feature removed

// Mock data for user progress
let userProgress = [
  {
    userId: 'user1@example.com',
    category: 'alphabet',
    completedLessons: 15,
    totalLessons: 26,
    completionRate: 57.7,
    lastActivity: new Date('2024-01-30')
  },
  {
    userId: 'user2@example.com',
    category: 'numbers',
    completedLessons: 8,
    totalLessons: 10,
    completionRate: 80.0,
    lastActivity: new Date('2024-01-29')
  },
  {
    userId: 'user3@example.com',
    category: 'phrases',
    completedLessons: 12,
    totalLessons: 20,
    completionRate: 60.0,
    lastActivity: new Date('2024-01-28')
  }
];

// GET /api/support/tickets - Get all support tickets
router.get('/tickets', protect, adminAndSuperAdmin, (req, res) => {
  res.json({
    success: true,
    data: supportTickets
  });
});

// PUT /api/support/tickets/:id/reply - Reply to a ticket
router.put('/tickets/:id/reply', protect, adminAndSuperAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const ticketIndex = supportTickets.findIndex(ticket => ticket.id === parseInt(id));
    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    supportTickets[ticketIndex] = {
      ...supportTickets[ticketIndex],
      status: 'replied',
      reply,
      repliedAt: new Date()
    };

    res.json({
      success: true,
      data: supportTickets[ticketIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Forum endpoints removed

// GET /api/support/analytics - Get analytics data
router.get('/analytics', protect, adminAndSuperAdmin, (req, res) => {
  const analyticsData = [
    {
      category: 'Alphabet',
      views: 1250,
      completions: 890,
      successRate: 71.2
    },
    {
      category: 'Numbers',
      views: 890,
      completions: 650,
      successRate: 73.0
    },
    {
      category: 'Phrases',
      views: 650,
      completions: 420,
      successRate: 64.6
    },
    {
      category: 'Quizzes',
      views: 420,
      completions: 127,
      successRate: 30.2
    }
  ];

  res.json({
    success: true,
    data: analyticsData
  });
});

// POST /api/support/report - Report issue to Super Admin
router.post('/report', protect, adminAndSuperAdmin, (req, res) => {
  try {
    const { section, note } = req.body;

    // In a real application, this would be stored in a database
    // and sent to the Super Admin via email or notification system
    console.log('Issue reported:', { section, note, reportedBy: req.user.email });

    res.json({
      success: true,
      message: 'Issue reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router; 