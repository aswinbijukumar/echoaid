import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';
import logger from '../utils/prettyLogger.js';

// Get list of user's certificates
export const getMyCertificates = async (req, res) => {
    try {
        const userId = req.user.id;
        let certificates = await Certificate.find({ user: userId })
            .sort({ issueDate: -1 });

        // Normalize titles for frontend compatibility (legacy support)
        const titleMap = {
            'Level 0 Mastery in ASL': 'Level 0 Basics',
            'Level 1 Mastery in ASL': 'Level 1 Mastery',
            'Level 2 Mastery in ASL': 'Level 2 Intermediate',
            'Level 3 Mastery in ASL': 'Level 3 Advanced'
        };

        const normalizedCertificates = certificates.map(cert => {
            const certObj = cert.toObject();
            if (titleMap[certObj.title]) {
                certObj.title = titleMap[certObj.title];
            }
            return certObj;
        });

        // Self-Healing: Check if user has Level 1 but missing Level 0 (Level 0 Mastery)
        // Since Level 0 Quiz was removed, we auto-grant Level 0 if Level 1 is achieved.
        const hasLevel1 = certificates.some(c => c.title === 'Level 1 Mastery' || c.title === 'Level 1 Mastery in ASL');
        const hasLevel0 = certificates.some(c => c.title === 'Level 0 Mastery' || c.title === 'Level 0 Basics');

        if (hasLevel1 && !hasLevel0) {
            try {
                logger.info('🩹 Self-healing: Auto-granting Level 0 Mastery because Level 1 is unlocked', { userId }, 'CONTROLLER');
                const newCert = await new Certificate({
                    user: userId,
                    title: 'Level 0 Mastery',
                    type: 'level_mastery',
                    referenceModel: 'LearningPath', // Generic reference since quiz is gone
                    issueDate: new Date() // Now
                }).save();
                certificates.unshift(newCert); // Add to local list
            } catch (err) {
                logger.error('Failed to auto-issue Level 0 cert', err);
            }
        }

        // Refetch to be clean or just use local manipulation (above)
        // Let's sort after potential insertion.

        res.status(200).json({
            success: true,
            data: certificates
        });
    } catch (error) {
        logger.errorWithStack('Get certificates error', error, 'CONTROLLER');
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificates'
        });
    }
};

// Update certificate recipient name
export const updateCertificateName = async (req, res) => {
    try {
        const { id } = req.params;
        const { recipientName } = req.body;
        const userId = req.user.id;

        if (!recipientName || recipientName.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Recipient name is required' });
        }

        const certificate = await Certificate.findOne({ _id: id, user: userId });
        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        if (certificate.nameUpdates >= 2) {
            return res.status(400).json({
                success: false,
                message: 'Maximum name changes reached (2). Please contact support for corrections.'
            });
        }

        certificate.recipientName = recipientName.trim();
        certificate.nameUpdates = (certificate.nameUpdates || 0) + 1;
        await certificate.save();

        res.json({ success: true, data: certificate });
    } catch (error) {
        logger.errorWithStack('Update certificate name error', error, 'CONTROLLER');
        res.status(500).json({ success: false, message: 'Failed to update certificate name' });
    }
};

// Download a specific certificate PDF
export const downloadCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const certificate = await Certificate.findOne({ _id: id, user: userId });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found or access denied'
            });
        }

        const user = await User.findById(userId).lean();

        // Merge recipientName from certificate into user data for PDF generator
        const pdfUserData = {
            ...user,
            recipientName: certificate.recipientName
        };

        // Generate PDF on the fly
        const pdfData = await generateCertificatePDF(pdfUserData, certificate.title);

        // Send buffer as file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfData.fileName}"`);
        res.send(pdfData.buffer);

    } catch (error) {
        logger.errorWithStack('Download certificate error', error, 'CONTROLLER');
        res.status(500).json({
            success: false,
            message: 'Failed to generate certificate'
        });
    }
};
