import express from 'express';
import { getTermsOfService, getPrivacyPolicy } from '../controllers/legalController.js';

const router = express.Router();

// Legal document routes
router.get('/terms', getTermsOfService);
router.get('/privacy', getPrivacyPolicy);

export default router;