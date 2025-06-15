import { Router } from 'express';
import * as reportHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { createReportBodySchema } from './validations';

const router = Router();

// Submit a new report
router.post(
  '/',
  validationMiddleware({ body: createReportBodySchema }),
  reportHandlers.createReport
);

export default router; 