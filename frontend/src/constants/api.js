// API configuration constants
import { ENV_CONFIG } from '../config/prettyConfig.js';

export const API_BASE_URL = ENV_CONFIG.API_BASE_URL.endsWith('/api') ? ENV_CONFIG.API_BASE_URL : `${ENV_CONFIG.API_BASE_URL}/api`;

// Helper to build full API URL
export const apiUrl = (path) => {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${safePath}`;
};

// Helper to include Bearer token automatically
export const withAuth = (options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return { ...options, headers };
};

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