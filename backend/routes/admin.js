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
  getUserStats,
  toggleUserStatus
} from '../controllers/adminController.js';
import { protect, adminAndSuperAdmin, canManageUsers, canViewAnalytics } from '../middleware/roleAuth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard and analytics routes (Admin and Super Admin)
router.get('/dashboard', adminAndSuperAdmin, canViewAnalytics, getAdminDashboard);
router.get('/stats', adminAndSuperAdmin, canViewAnalytics, getUserStats);

// Admin management routes (Super Admin only)
router.get('/admins', adminAndSuperAdmin, canManageUsers, getAllAdmins);
router.post('/admins', adminAndSuperAdmin, canManageUsers, createAdmin);
router.get('/admins/:id', adminAndSuperAdmin, canManageUsers, getAdminById);
router.put('/admins/:id', adminAndSuperAdmin, canManageUsers, updateAdmin);
router.delete('/admins/:id', adminAndSuperAdmin, canManageUsers, deleteAdmin);

// User management routes (Admin and Super Admin)
router.get('/users', adminAndSuperAdmin, canManageUsers, getManagedUsers);
router.post('/users', adminAndSuperAdmin, canManageUsers, createUser);
router.get('/users/:id', adminAndSuperAdmin, canManageUsers, getUserById);
router.put('/users/:id', adminAndSuperAdmin, canManageUsers, updateUser);
router.patch('/users/:id/toggle-status', adminAndSuperAdmin, canManageUsers, toggleUserStatus);
router.delete('/users/:id', adminAndSuperAdmin, canManageUsers, deleteUser);

export default router; 