import { Router } from 'express';
import * as followHandlers from './handlers';
import { protectRoute } from '@/common/middleware/auth.middleware';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { userIdParamSchema, getFollowsQuerySchema } from './validations';

const router = Router();

// Follow a user
router.post(
  '/:userId/follow',
  protectRoute,
  validationMiddleware({ params: userIdParamSchema }),
  followHandlers.followUser
);

// Unfollow a user
router.delete(
  '/:userId/follow',
  protectRoute,
  validationMiddleware({ params: userIdParamSchema }),
  followHandlers.unfollowUser
);

// Get a user's followers
router.get(
  '/:userId/followers',
  validationMiddleware({ params: userIdParamSchema, query: getFollowsQuerySchema }),
  followHandlers.getFollowers
);

// Get users a user is following
router.get(
  '/:userId/following',
  validationMiddleware({ params: userIdParamSchema, query: getFollowsQuerySchema }),
  followHandlers.getFollowing
);

export default router; 