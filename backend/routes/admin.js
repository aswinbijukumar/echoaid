import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdminDashboard,
  createUser,
  getUserStats
} from '../controllers/adminController.js';
import { protect, superAdminOnly, adminAndSuperAdmin, canManageUsers, canViewAnalytics } from '../middleware/roleAuth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard and analytics routes (Admin and Super Admin)
router.get('/dashboard', adminAndSuperAdmin, canViewAnalytics, getAdminDashboard);
router.get('/stats', adminAndSuperAdmin, canViewAnalytics, getUserStats);

// User management routes (Super Admin only)
router.get('/users', superAdminOnly, canManageUsers, getAllUsers);
router.post('/users', superAdminOnly, canManageUsers, createUser);
router.get('/users/:id', superAdminOnly, canManageUsers, getUserById);
router.put('/users/:id', superAdminOnly, canManageUsers, updateUser);
router.delete('/users/:id', superAdminOnly, canManageUsers, deleteUser);

export default router; 