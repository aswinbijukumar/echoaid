import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dictionaryRoutes from './routes/dictionary.js';
import adminRoutes from './routes/admin.js';
import contentRoutes from './routes/content.js';
import supportRoutes from './routes/support.js';

// Load env vars
dotenv.config({ path: './config.env' });

const app = express();

// Body parser - increase limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

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

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'EchoAid API is running',
    timestamp: new Date().toISOString()
  });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
}); 