import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow anonymous conversations
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant', 'system'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        metadata: {
            detectedSign: String,
            confidence: Number,
            signKey: String,
            learningLevel: String
        }
    }],
    context: {
        currentSign: String,
        learningLevel: String,
        lastActivity: {
            type: Date,
            default: Date.now
        },
        totalMessages: {
            type: Number,
            default: 0
        }
    },
    aiProvider: {
        type: String,
        enum: ['openai', 'anthropic', 'openrouter', 'llama2', 'mistral', 'deepseek', 'gemini'],
        default: 'deepseek'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
conversationSchema.index({ userId: 1, createdAt: -1 });


// Auto-update context on message add
conversationSchema.pre('save', function (next) {
    if (this.messages && this.messages.length > 0) {
        this.context.totalMessages = this.messages.length;
        this.context.lastActivity = new Date();
    }
    next();
});

// Method to add message
conversationSchema.methods.addMessage = function (role, content, metadata = {}) {
    this.messages.push({
        role,
        content,
        timestamp: new Date(),
        metadata
    });
    return this.save();
};

// Method to get recent messages for AI context
conversationSchema.methods.getRecentMessages = function (limit = 10) {
    return this.messages
        .slice(-limit)
        .map(m => ({
            role: m.role,
            content: m.content
        }));
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function (userId, sessionId, aiProvider = 'deepseek') {
    let conversation = await this.findOne({ sessionId });

    if (!conversation) {
        conversation = await this.create({
            userId: userId || null,
            sessionId,
            aiProvider,
            messages: [],
            context: {
                lastActivity: new Date(),
                totalMessages: 0
            }
        });
    }

    return conversation;
};

export default mongoose.model('Conversation', conversationSchema);
