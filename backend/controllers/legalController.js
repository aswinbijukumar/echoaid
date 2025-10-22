import logger from '../utils/prettyLogger.js';

/**
 * Get Terms of Service
 * @route GET /api/legal/terms
 * @access Public
 */
export const getTermsOfService = async (req, res) => {
  try {
    logger.info('Terms of Service requested', {}, 'LEGAL');
    
    const termsOfService = {
      title: "Terms of Service - EchoAid",
      lastUpdated: new Date().toISOString().split('T')[0],
      content: {
        introduction: "Welcome to EchoAid! These Terms of Service ('Terms') govern your use of our sign language learning platform and services.",
        
        acceptance: "By accessing or using EchoAid, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.",
        
        services: {
          title: "Our Services",
          description: "EchoAid provides an interactive sign language learning platform featuring:",
          features: [
            "Real-time sign language recognition",
            "Interactive learning modules",
            "Progress tracking and assessments",
            "AI-powered coaching and feedback",
            "Community features and support"
          ]
        },
        
        userAccounts: {
          title: "User Accounts",
          description: "To access certain features, you must create an account. You agree to:",
          requirements: [
            "Provide accurate and complete information",
            "Maintain the security of your password",
            "Accept responsibility for all activities under your account",
            "Notify us immediately of any unauthorized use"
          ]
        },
        
        acceptableUse: {
          title: "Acceptable Use",
          description: "You agree not to:",
          restrictions: [
            "Use the service for any unlawful purpose",
            "Attempt to gain unauthorized access to our systems",
            "Interfere with or disrupt the service",
            "Use automated systems to access the service",
            "Share your account credentials with others",
            "Upload malicious content or viruses"
          ]
        },
        
        intellectualProperty: {
          title: "Intellectual Property",
          description: "The EchoAid platform, including its design, content, and technology, is protected by intellectual property laws. You may not:",
          restrictions: [
            "Copy, modify, or distribute our content without permission",
            "Reverse engineer our software",
            "Use our trademarks or logos without authorization",
            "Create derivative works based on our platform"
          ]
        },
        
        privacy: {
          title: "Privacy",
          description: "Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information."
        },
        
        subscriptions: {
          title: "Subscriptions and Payments",
          description: "Some features may require a subscription. By subscribing, you agree to:",
          terms: [
            "Pay all applicable fees as described",
            "Automatic renewal unless cancelled",
            "No refunds for unused portions of subscriptions",
            "Price changes with 30 days notice"
          ]
        },
        
        termination: {
          title: "Termination",
          description: "We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users."
        },
        
        disclaimers: {
          title: "Disclaimers",
          description: "EchoAid is provided 'as is' without warranties of any kind. We do not guarantee:",
          limitations: [
            "Uninterrupted or error-free service",
            "Accuracy of sign language recognition",
            "Compatibility with all devices",
            "Results from using our learning modules"
          ]
        },
        
        liability: {
          title: "Limitation of Liability",
          description: "To the maximum extent permitted by law, EchoAid shall not be liable for any indirect, incidental, special, or consequential damages."
        },
        
        changes: {
          title: "Changes to Terms",
          description: "We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification."
        },
        
        contact: {
          title: "Contact Information",
          description: "If you have questions about these Terms, please contact us at:",
          details: {
            email: "legal@echoaid.com",
            address: "EchoAid Legal Department",
            support: "For technical support, visit our help center"
          }
        }
      }
    };
    
    res.status(200).json({
      success: true,
      data: termsOfService
    });
    
  } catch (error) {
    logger.errorWithStack('Terms of Service error', error, 'LEGAL');
    res.status(500).json({
      success: false,
      message: 'Error retrieving Terms of Service'
    });
  }
};

/**
 * Get Privacy Policy
 * @route GET /api/legal/privacy
 * @access Public
 */
export const getPrivacyPolicy = async (req, res) => {
  try {
    logger.info('Privacy Policy requested', {}, 'LEGAL');
    
    const privacyPolicy = {
      title: "Privacy Policy - EchoAid",
      lastUpdated: new Date().toISOString().split('T')[0],
      content: {
        introduction: "This Privacy Policy explains how EchoAid collects, uses, and protects your information when you use our sign language learning platform.",
        
        informationCollection: {
          title: "Information We Collect",
          personalInfo: {
            title: "Personal Information",
            description: "We collect information you provide directly to us:",
            types: [
              "Name and email address (for account creation)",
              "Profile information and preferences",
              "Learning progress and achievements",
              "Communication with our support team"
            ]
          },
          usageInfo: {
            title: "Usage Information",
            description: "We automatically collect certain information:",
            types: [
              "Device information (type, operating system)",
              "Usage patterns and learning behavior",
              "Performance data and error logs",
              "Camera and microphone data (for sign recognition)"
            ]
          }
        },
        
        dataUsage: {
          title: "How We Use Your Information",
          purposes: [
            "Provide and improve our learning services",
            "Personalize your learning experience",
            "Track your progress and achievements",
            "Provide customer support",
            "Ensure platform security and prevent fraud",
            "Comply with legal obligations"
          ]
        },
        
        dataSharing: {
          title: "Information Sharing",
          description: "We do not sell your personal information. We may share information:",
          circumstances: [
            "With your explicit consent",
            "To comply with legal requirements",
            "With service providers who assist our operations",
            "In connection with business transfers or mergers"
          ]
        },
        
        dataSecurity: {
          title: "Data Security",
          description: "We implement appropriate security measures to protect your information:",
          measures: [
            "Encryption of data in transit and at rest",
            "Regular security assessments and updates",
            "Access controls and authentication",
            "Secure data storage and backup procedures"
          ]
        },
        
        cookies: {
          title: "Cookies and Tracking",
          description: "We use cookies and similar technologies to:",
          purposes: [
            "Remember your preferences and settings",
            "Analyze usage patterns and improve our service",
            "Provide personalized content and recommendations",
            "Ensure platform security and prevent abuse"
          ]
        },
        
        dataRetention: {
          title: "Data Retention",
          description: "We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time."
        },
        
        userRights: {
          title: "Your Rights",
          description: "You have the right to:",
          rights: [
            "Access your personal information",
            "Correct inaccurate or incomplete data",
            "Request deletion of your data",
            "Object to certain processing activities",
            "Data portability (receive your data in a structured format)"
          ]
        },
        
        childrenPrivacy: {
          title: "Children's Privacy",
          description: "EchoAid is designed for users of all ages. We do not knowingly collect personal information from children under 13 without parental consent."
        },
        
        internationalTransfers: {
          title: "International Data Transfers",
          description: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers."
        },
        
        updates: {
          title: "Updates to Privacy Policy",
          description: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification."
        },
        
        contact: {
          title: "Contact Us",
          description: "If you have questions about this Privacy Policy or our data practices, please contact us:",
          details: {
            email: "privacy@echoaid.com",
            address: "EchoAid Privacy Team",
            support: "For data-related requests, use our privacy request form"
          }
        }
      }
    };
    
    res.status(200).json({
      success: true,
      data: privacyPolicy
    });
    
  } catch (error) {
    logger.errorWithStack('Privacy Policy error', error, 'LEGAL');
    res.status(500).json({
      success: false,
      message: 'Error retrieving Privacy Policy'
    });
  }
};

export default {
  getTermsOfService,
  getPrivacyPolicy
};