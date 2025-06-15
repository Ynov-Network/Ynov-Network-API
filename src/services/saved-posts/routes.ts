import { Router } from 'express';
import * as savedPostHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { postIdParamsSchema, getSavedPostsQuerySchema } from './validations';

const router = Router();

// Toggle saving/unsaving a post
router.post(
  '/posts/:postId/save',
  validationMiddleware({ params: postIdParamsSchema }),
  savedPostHandlers.toggleSavePost
);

// Get the current user's saved posts
router.get(
  '/me/saved-posts',
  validationMiddleware({ query: getSavedPostsQuerySchema }),
  savedPostHandlers.getSavedPosts
);

export default router; 