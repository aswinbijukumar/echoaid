import Message from '../models/Message.js';
import logger from '../utils/prettyLogger.js';
import User from '../models/User.js';

// Get all messages for admin
export const getMessages = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    
    // Get messages with pagination
    const messages = await Message.find(filter)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count for pagination
    const total = await Message.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.errorWithStack('Error fetching messages:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Get message by ID
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role');
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    logger.errorWithStack('Error fetching message:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to fetch message' });
  }
};

// Create new message (user to admin)
export const createMessage = async (req, res) => {
  try {
    const { subject, message, category = 'general', priority = 'medium' } = req.body;
    const senderId = req.user.id;
    
    // Find an admin to assign the message to
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'No admin available to receive your message' 
      });
    }
    
    const newMessage = new Message({
      sender: senderId,
      recipient: admin._id,
      subject,
      message,
      category,
      priority
    });
    
    await newMessage.save();
    
    // Populate sender info for response
    await newMessage.populate('sender', 'name email role');
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    logger.errorWithStack('Error creating message:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Admin reply to message
export const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    // Update message with admin reply
    message.adminReply = adminReply;
    message.repliedAt = new Date();
    message.status = 'resolved';
    message.isReadByUser = false; // User hasn't seen the reply yet
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (error) {
    logger.errorWithStack('Error replying to message:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
};

// Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    message.status = status;
    await message.save();
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: message
    });
  } catch (error) {
    logger.errorWithStack('Error updating message status:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { readBy } = req.body; // 'admin' or 'user'
    
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    if (readBy === 'admin') {
      message.isReadByAdmin = true;
    } else if (readBy === 'user') {
      message.isReadByUser = true;
    }
    
    await message.save();
    
    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    logger.errorWithStack('Error marking message as read:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

// Get user's messages
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const messages = await Message.find({ sender: userId })
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Message.countDocuments({ sender: userId });
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.errorWithStack('Error fetching user messages:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Get message statistics for admin
export const getMessageStats = async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isReadByAdmin: false });
    const urgentMessages = await Message.countDocuments({ priority: 'urgent', status: { $ne: 'resolved' } });
    
    res.json({
      success: true,
      data: {
        totalMessages,
        unreadMessages,
        urgentMessages,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    logger.errorWithStack('Error fetching message stats:', error, error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};
