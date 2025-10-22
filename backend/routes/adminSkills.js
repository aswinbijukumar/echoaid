import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillById
} from '../controllers/adminSkillController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Admin skill routes
router.get('/', getAdminSkills);
router.get('/:id', getSkillById);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
