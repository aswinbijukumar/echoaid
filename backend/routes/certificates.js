import express from 'express';
import { getMyCertificates, downloadCertificate, updateCertificateName } from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/mine', getMyCertificates);
router.get('/download/:id', downloadCertificate);
router.put('/:id/name', updateCertificateName);

export default router;
