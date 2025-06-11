import { Router } from 'express';
import * as reportHandlers from './handlers';
import { protectRoute } from '@/common/middleware/auth.middleware';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { createReportBodySchema } from './validations';

const router = Router();

// Submit a new report
router.post(
  '/',
  protectRoute,
  validationMiddleware({ body: createReportBodySchema }),
  reportHandlers.createReport
);

export default router; 