import { Router } from 'express';
import * as followHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  userIdParamSchema,
  getFollowsQuerySchema,
  manageFollowRequestSchema
} from './validations';

const router = Router();

// --- Follow Actions ---

// Follow a user or send a follow request
router.post(
  '/:userId/follow',
  validationMiddleware({ params: userIdParamSchema }),
  followHandlers.followUser
);

// Unfollow a user
router.delete(
  '/:userId/follow',
  validationMiddleware({ params: userIdParamSchema }),
  followHandlers.unfollowUser
);


// --- Follow Requests ---

// Get pending follow requests for the logged-in user
router.get(
  '/requests',
  followHandlers.getFollowRequests
);

// Accept or reject a follow request
router.post(
  '/requests/:userId',
  validationMiddleware({ params: userIdParamSchema, body: manageFollowRequestSchema }),
  followHandlers.manageFollowRequest
);


// --- Follower/Following Lists ---

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