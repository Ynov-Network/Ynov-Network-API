import { Router } from 'express';
import * as moderationHandlers from './handlers';
import { protectRoute } from '@/common/middleware/auth.middleware';
import { requireAdmin } from '@/common/middleware/admin.middleware';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  getReportsQuerySchema,
  reportIdParamsSchema,
  updateReportStatusBodySchema,
} from './validations';

const router = Router();

// All routes in this file require admin access
router.use(protectRoute);
router.use(requireAdmin);

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

// TODO: Add routes for other moderation actions like banning a user, deleting content directly, etc.

export default router; 