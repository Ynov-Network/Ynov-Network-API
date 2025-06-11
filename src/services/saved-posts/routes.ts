import { Router } from 'express';
import * as savedPostHandlers from './handlers';
import { protectRoute } from '@/common/middleware/auth.middleware';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { postIdParamsSchema, getSavedPostsQuerySchema } from './validations';

const router = Router();

// Toggle saving/unsaving a post
router.post(
  '/posts/:postId/save',
  protectRoute,
  validationMiddleware({ params: postIdParamsSchema }),
  savedPostHandlers.toggleSavePost
);

// Get the current user's saved posts
router.get(
  '/me/saved-posts',
  protectRoute,
  validationMiddleware({ query: getSavedPostsQuerySchema }),
  savedPostHandlers.getSavedPosts
);

export default router; 