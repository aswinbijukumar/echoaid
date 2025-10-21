import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all messages for admin (with filtering and pagination)
export const getMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      priority, 
      search,
      unreadOnly = false 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (unreadOnly === 'true') filter.isReadByAdmin = false;
    
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get messages with pagination
    const messages = await Message.find(filter)
      .populate('userId', 'name email avatar')
      .populate('repliedBy', 'name email')
      .populate('readBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Message.countDocuments(filter);

    // Get unread count
    const unreadCount = await Message.countDocuments({ 
      isReadByAdmin: false, 
      status: { $in: ['new', 'read'] } 
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get message by ID
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate('userId', 'name email avatar')
      .populate('repliedBy', 'name email')
      .populate('readBy', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndUpdate(
      id,
      {
        isReadByAdmin: true,
        readBy: req.user._id,
        readAt: new Date(),
        status: 'read'
      },
      { new: true }
    ).populate('userId', 'name email avatar');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reply to message
export const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status = 'replied' } = req.body;

    if (!reply || reply.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      {
        reply: reply.trim(),
        repliedBy: req.user._id,
        repliedAt: new Date(),
        status,
        isReadByAdmin: true,
        readBy: req.user._id,
        readAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email avatar')
     .populate('repliedBy', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // TODO: Send email notification to user about the reply
    // await sendEmailNotification(message.userEmail, message.subject, reply);

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'read', 'replied', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData = { status };
    
    // If marking as read, also update read fields
    if (status === 'read' || status === 'replied' || status === 'resolved') {
      updateData.isReadByAdmin = true;
      updateData.readBy = req.user._id;
      updateData.readAt = new Date();
    }

    const message = await Message.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email avatar')
     .populate('readBy', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get message statistics
export const getMessageStats = async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isReadByAdmin', false] }, { $in: ['$status', ['new', 'read']] }] },
                1,
                0
              ]
            }
          },
          byStatus: {
            $push: {
              status: '$status',
              isRead: '$isReadByAdmin'
            }
          },
          byCategory: {
            $push: {
              category: '$category',
              isRead: '$isReadByAdmin'
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              isRead: '$isReadByAdmin'
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, unread: 0, byStatus: [], byCategory: [], byPriority: [] };

    // Count by status
    const statusCounts = result.byStatus.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    // Count by category
    const categoryCounts = result.byCategory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Count by priority
    const priorityCounts = result.byPriority.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: result.total,
        unread: result.unread,
        byStatus: statusCounts,
        byCategory: categoryCounts,
        byPriority: priorityCounts
      }
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a new message (for users)
export const createMessage = async (req, res) => {
  try {
    const { subject, message, category = 'general', priority = 'medium' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    const newMessage = new Message({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      subject: subject.trim(),
      message: message.trim(),
      category,
      priority,
      deviceInfo: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        platform: req.get('User-Agent')?.includes('Mobile') ? 'Mobile' : 'Desktop'
      }
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};