import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import dictionaryRoutes from './routes/dictionary.js';
import adminRoutes from './routes/admin.js';
import contentRoutes from './routes/content.js';
import supportRoutes from './routes/support.js';
import practiceRoutes from './routes/practice.js';
import quizRoutes from './routes/quiz.js';
import adminQuizRoutes from './routes/adminQuiz.js';
import aiRoutes from './routes/ai.js';
import subscriptionRoutes from './routes/subscription.js';
import adminSubscriptionRoutes from './routes/adminSubscription.js';
import curriculumRoutes from './routes/curriculum.js';
import skillRoutes from './routes/skills.js';
import adminSkillsRoutes from './routes/adminSkills.js';
import uploadRoutes from './routes/upload.js';
import ttsRoutes from './routes/tts.js';
import messagesRoutes from './routes/messages.js';
import quizGeneratorRoutes from './routes/quizGenerator.js';
import legalRoutes from './routes/legal.js';
import streakRoutes from './routes/streak.js';
import achievementRoutes from './routes/achievements.js';
import { getAllCategories, getCategoryById, createSignWithVariants } from './controllers/contentController.js';
import { errorHandler } from './utils/errorHandler.js';
import { protect, adminAndSuperAdmin, canManageContent } from './middleware/roleAuth.js';
import fileUpload from 'express-fileupload';
import logger from './utils/prettyLogger.js';
import { requestLogger, errorLogger } from './middleware/prettyLogging.js';

// Load env vars
dotenv.config({ path: './config.env' });

// Configure Cloudinary
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const app = express();

// Body parser - increase limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Manual CORS headers as backup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Use pretty logging middleware
app.use(requestLogger);

// Serve static assets (images, videos, thumbnails) under /assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.database('Connected', 'MongoDB', null, 'SERVER'))
  .catch(err => {
    logger.errorWithStack('MongoDB connection failed', err, 'DATABASE');
    logger.warning('Server will continue without database connection for testing...', null, 'SERVER');
  });

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/content', contentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin/quiz', adminQuizRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/curriculum/skills', skillRoutes);
app.use('/api/skills', skillRoutes); // Add direct skills route for frontend
app.use('/api/admin/skills', adminSkillsRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/tts', ttsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin/quiz-generator', quizGeneratorRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/achievements', achievementRoutes);

// Public aliases for categories so user Dictionary can access them without auth
app.get('/api/content/categories', getAllCategories);
app.get('/api/content/categories/:id', getCategoryById);

// Public debug endpoint for upload testing
app.get('/api/upload/debug', (req, res) => {
  const config = cloudinary.config();
  res.json({
    success: true,
    message: 'Cloudinary debug info',
    cloudinary: {
      hasApiKey: !!config.api_key,
      hasCloudName: !!config.cloud_name,
      hasApiSecret: !!config.api_secret,
      cloudName: config.cloud_name
    },
    environment: {
      hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    }
  });
});

// Public test endpoint for upload testing
app.get('/api/upload/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Public route for bulk variants (with authentication)
app.post('/api/content/signs/bulk-variants', 
  protect, 
  adminAndSuperAdmin, 
  canManageContent,
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: './tmp/'
  }),
  createSignWithVariants
);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'EchoAid API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug file upload route
app.post('/api/debug/upload', 
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: './tmp/'
  }),
  (req, res) => {
    logger.debug('Debug upload request received', { files: req.files, body: req.body }, 'UPLOAD');
    
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const file = req.files[key];
        logger.debug(`File ${key} processed`, {
          name: file.name,
          size: file.size,
          tempFilePath: file.tempFilePath,
          path: file.path
        }, 'UPLOAD');
      });
    }
    
    res.json({
      success: true,
      message: 'Debug upload successful',
      files: req.files ? Object.keys(req.files) : [],
      body: req.body
    });
  }
);

// 404 handler
app.use('*', (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use(errorLogger);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  const services = [
    'Authentication',
    'Content Management', 
    'Practice System',
    'Quiz Engine',
    'Gamification',
    'Sign Recognition',
    'Admin Dashboard',
    'Subscription Management'
  ];
  
  logger.startup(PORT, process.env.NODE_ENV || 'development', services);
});