import { Router } from 'express';
import * as uploadHandlers from './handlers';
import { protectRoute } from '@/common/middleware/auth.middleware';
import upload from '@/common/middleware/multer.middleware';

const router = Router();

// Upload a single media file (image or video)
router.post(
  '/',
  protectRoute,
  upload.single('media'), // 'media' is the field name in the form-data
  uploadHandlers.uploadMedia
);

export default router; 