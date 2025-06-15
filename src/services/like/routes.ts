import { Router } from 'express';
import * as likeHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware'; // Adjust path
import { postIdParamsSchema, getLikesQuerySchema } from './validations';

const router = Router();

router.post(
  '/:postId/toggle', // Using a more descriptive path for the toggle action
  validationMiddleware({ params: postIdParamsSchema }),
  likeHandlers.toggleLike
);

// Get users who liked a post (publicly accessible)
router.get(
  '/:postId/users',
  validationMiddleware({ params: postIdParamsSchema, query: getLikesQuerySchema }),
  likeHandlers.getLikesForPost
);


export default router;