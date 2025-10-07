import express from 'express';
import {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  createAdmin,
  getManagedUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getAdminDashboard,
  getUserStats
} from '../controllers/adminController.js';
import { protect, superAdminOnly, adminAndSuperAdmin, canManageUsers, canViewAnalytics } from '../middleware/roleAuth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard and analytics routes (Admin and Super Admin)
router.get('/dashboard', adminAndSuperAdmin, canViewAnalytics, getAdminDashboard);
router.get('/stats', adminAndSuperAdmin, canViewAnalytics, getUserStats);

// Admin management routes (Super Admin only)
router.get('/admins', superAdminOnly, canManageUsers, getAllAdmins);
router.post('/admins', superAdminOnly, canManageUsers, createAdmin);
router.get('/admins/:id', superAdminOnly, canManageUsers, getAdminById);
router.put('/admins/:id', superAdminOnly, canManageUsers, updateAdmin);
router.delete('/admins/:id', superAdminOnly, canManageUsers, deleteAdmin);

// User management routes (Admin and Super Admin)
router.get('/users', adminAndSuperAdmin, canManageUsers, getManagedUsers);
router.post('/users', adminAndSuperAdmin, canManageUsers, createUser);
router.get('/users/:id', adminAndSuperAdmin, canManageUsers, getUserById);
router.put('/users/:id', adminAndSuperAdmin, canManageUsers, updateUser);
router.delete('/users/:id', adminAndSuperAdmin, canManageUsers, deleteUser);

export default router; 