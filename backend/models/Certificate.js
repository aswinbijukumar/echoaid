import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    recipientName: {
        type: String, // Custom name for the certificate
        trim: true
    },
    type: {
        type: String,
        enum: ['course', 'level_mastery', 'special_achievement'],
        default: 'level_mastery'
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        required: true,
        enum: ['Quiz', 'LearningPath']
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    certificateCode: {
        type: String,
        unique: true
    },
    pdfUrl: {
        type: String // Optional: if you store it in Cloudinary later
    },
    nameUpdates: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate unique code before save
certificateSchema.pre('save', function (next) {
    if (!this.certificateCode) {
        this.certificateCode = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
    next();
});

export default mongoose.model('Certificate', certificateSchema);
