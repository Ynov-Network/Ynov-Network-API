import { Router } from 'express';
import * as notificationHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { getNotificationsQuerySchema, notificationIdParamsSchema } from './validations';

const router = Router();

// Get all notifications for the logged-in user
router.get(
  '/',
  validationMiddleware({ query: getNotificationsQuerySchema }),
  notificationHandlers.getNotifications
);

// Mark a specific notification as read
router.put(
  '/:notificationId/read',
  validationMiddleware({ params: notificationIdParamsSchema }),
  notificationHandlers.markAsRead
);

// Mark all notifications as read
router.post(
  '/read-all',
  notificationHandlers.markAllAsRead
);

router.delete(
  '/:notificationId',
  validationMiddleware({ params: notificationIdParamsSchema }),
  notificationHandlers.deleteNotification
);

export default router;
