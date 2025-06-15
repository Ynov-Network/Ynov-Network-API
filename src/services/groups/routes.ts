import { Router } from 'express';
import * as groupHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  createGroupBodySchema,
  updateGroupBodySchema,
  getGroupsQuerySchema,
  groupIdParamsSchema,
} from './validations';

const router = Router();

// --- Group Collection Routes ---
router.post(
  '/',
  validationMiddleware({ body: createGroupBodySchema }),
  groupHandlers.createGroup
);

router.get(
  '/',
  validationMiddleware({ query: getGroupsQuerySchema }),
  groupHandlers.getAllGroups
);

// --- Single Group Routes ---
router.get(
  '/:groupId',
  validationMiddleware({ params: groupIdParamsSchema }),
  groupHandlers.getGroupById
);

router.put(
  '/:groupId',
  validationMiddleware({ params: groupIdParamsSchema, body: updateGroupBodySchema }),
  groupHandlers.updateGroup
);

router.delete(
  '/:groupId',
  validationMiddleware({ params: groupIdParamsSchema }),
  groupHandlers.deleteGroup
);

// --- Membership Routes ---
router.post(
  '/:groupId/join',
  validationMiddleware({ params: groupIdParamsSchema }),
  groupHandlers.joinGroup
);

router.delete(
  '/:groupId/leave',
  validationMiddleware({ params: groupIdParamsSchema }),
  groupHandlers.leaveGroup
);

export default router; 