import express from 'express';
import {
  getAllSigns,
  getSignById,
  createSign,
  updateSign,
  deleteSign,
  bulkSignOperations,
  getContentStats,
  exportSigns,
  getContentQueue,
  updateQueueItem,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/contentController.js';
import { protect, adminAndSuperAdmin, canManageContent } from '../middleware/roleAuth.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

// Public routes (no authentication required)
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);

// All other routes require authentication
router.use(protect);
router.use(adminAndSuperAdmin);
router.use(canManageContent);

// File upload middleware
router.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: false
}));

// Content statistics
router.get('/stats', getContentStats);

// Signs management routes
router.get('/signs', getAllSigns);
router.get('/signs/export', exportSigns);
router.get('/signs/:id', getSignById);
router.post('/signs', createSign);
router.put('/signs/:id', updateSign);
router.delete('/signs/:id', deleteSign);
router.post('/signs/bulk', bulkSignOperations);

// Content approval queue (Super Admin oversight)
router.get('/queue', getContentQueue);
router.put('/queue/:id', updateQueueItem);

// Category management routes (authenticated)
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Test endpoint to check authentication
router.get('/test-auth', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router; 