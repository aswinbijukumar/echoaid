// API configuration constants
export const API_BASE_URL = 'http://localhost:5000';

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    GOOGLE: '/auth/google',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/reset-password'
  },
  DICTIONARY: {
    SIGNS: '/dictionary/signs',
    DB_SIGNS: '/dictionary/db/signs'
  },
  QUIZ: {
    QUIZZES: '/quiz',
    QUIZ: '/quiz'
  },
  CONTENT: {
    CATEGORIES: '/content/categories'
  }
};