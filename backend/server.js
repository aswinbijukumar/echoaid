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
import { getAllCategories, getCategoryById, createSignWithVariants } from './controllers/contentController.js';
import { errorHandler } from './utils/errorHandler.js';
import { protect, adminAndSuperAdmin, canManageContent } from './middleware/roleAuth.js';
import fileUpload from 'express-fileupload';

// Load env vars
dotenv.config({ path: './config.env' });

const app = express();

// Body parser - increase limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Serve static assets (images, videos, thumbnails) under /assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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
app.use('/api/admin/skills', adminSkillsRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/tts', ttsRoutes);

// Public aliases for categories so user Dictionary can access them without auth
app.get('/api/content/categories', getAllCategories);
app.get('/api/content/categories/:id', getCategoryById);

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
    console.log('Debug upload request received');
    console.log('Files:', req.files);
    console.log('Body:', req.body);
    
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const file = req.files[key];
        console.log(`File ${key}:`, {
          name: file.name,
          size: file.size,
          tempFilePath: file.tempFilePath,
          path: file.path
        });
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
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});