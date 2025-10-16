import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sessionSecurity from '../utils/sessionSecurity.js';

dotenv.config({ path: './config.env' });

const cleanupSessions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await sessionSecurity.cleanupExpiredSessions();
    
    console.log('Session cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during session cleanup:', error);
    process.exit(1);
  }
};

cleanupSessions();