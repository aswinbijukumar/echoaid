import Conversation from '../models/Conversation.js';
import { protect } from '../middleware/roleAuth.js';

// Get conversation history
export async function getConversation(req, res) {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;

        const conversation = await Conversation.findOne({ sessionId });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check ownership (if user is logged in)
        if (userId && conversation.userId && conversation.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        return res.json({
            success: true,
            conversation: {
                sessionId: conversation.sessionId,
                messages: conversation.messages,
                context: conversation.context,
                aiProvider: conversation.aiProvider,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Clear conversation
export async function clearConversation(req, res) {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;

        const conversation = await Conversation.findOne({ sessionId });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check ownership
        if (userId && conversation.userId && conversation.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Clear messages
        conversation.messages = [];
        conversation.context.totalMessages = 0;
        conversation.context.lastActivity = new Date();
        await conversation.save();

        return res.json({
            success: true,
            message: 'Conversation cleared'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Export conversation
export async function exportConversation(req, res) {
    try {
        const { sessionId } = req.params;
        const userId = req.user?.id;

        const conversation = await Conversation.findOne({ sessionId });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check ownership
        if (userId && conversation.userId && conversation.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Format for export
        const exportData = {
            sessionId: conversation.sessionId,
            aiProvider: conversation.aiProvider,
            exportedAt: new Date().toISOString(),
            totalMessages: conversation.context.totalMessages,
            messages: conversation.messages.map(m => ({
                role: m.role,
                content: m.content,
                timestamp: m.timestamp,
                metadata: m.metadata
            }))
        };

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="echoaid-conversation-${sessionId}.json"`);

        return res.json(exportData);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get user's conversations list
export async function getUserConversations(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const conversations = await Conversation.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(20)
            .select('sessionId context aiProvider createdAt updatedAt');

        return res.json({
            success: true,
            conversations: conversations.map(c => ({
                sessionId: c.sessionId,
                totalMessages: c.context.totalMessages,
                lastActivity: c.context.lastActivity,
                aiProvider: c.aiProvider,
                createdAt: c.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
