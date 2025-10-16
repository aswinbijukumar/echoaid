import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config({ path: './config.env' });

// Test JWT token generation
const testUser = {
  id: 'test123',
  email: 'admin@echoaid.com',
  role: 'admin'
};

const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('Test JWT Token:');
console.log(token);
console.log('\nToken length:', token.length);
console.log('JWT Secret exists:', !!process.env.JWT_SECRET);