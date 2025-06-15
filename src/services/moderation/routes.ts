import { Router } from 'express';
import * as moderationHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  getReportsQuerySchema,
  reportIdParamsSchema,
  updateReportStatusBodySchema,
} from './validations';

const router = Router();

// All routes in this file require admin access

// Get all reports (with optional filters)
router.get(
  '/reports',
  validationMiddleware({ query: getReportsQuerySchema }),
  moderationHandlers.getReports
);

// Update the status of a specific report
router.put(
  '/reports/:reportId',
  validationMiddleware({ params: reportIdParamsSchema, body: updateReportStatusBodySchema }),
  moderationHandlers.updateReportStatus
);

export default router; 