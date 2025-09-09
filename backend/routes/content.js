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
  updateQueueItem
} from '../controllers/contentController.js';
import { protect, adminAndSuperAdmin, canManageContent } from '../middleware/roleAuth.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(adminAndSuperAdmin);
router.use(canManageContent);

// File upload middleware
router.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
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

export default router; 