import { Router } from 'express';
import * as userHandlers from './handlers';
import * as userValidations from './validations';
import { validate } from '@/middleware/validate'; // Assuming a general validation middleware
// import { isAuthenticated } from '@/middleware/auth'; // Assuming an auth middleware

const router = Router();

// --- Public routes ---
// Get user profile by ID
router.get(
  '/:userId',
  validate(userValidations.userIdSchema),
  userHandlers.getUserProfileById
);

// Get user profile by username
router.get(
  '/username/:username',
  validate(userValidations.usernameSchema),
  userHandlers.getUserProfileByUsername
);

// Search users
router.get(
  '/',
  validate(userValidations.searchUsersSchema),
  userHandlers.searchUsers
);

// Get user's followers
router.get(
  '/:userId/followers',
  validate(userValidations.userIdSchema),
  validate(userValidations.paginationSchema), // Apply pagination validation to query
  userHandlers.getUserFollowers
);

// Get user's following list
router.get(
  '/:userId/following',
  validate(userValidations.userIdSchema),
  validate(userValidations.paginationSchema), // Apply pagination validation to query
  userHandlers.getUserFollowing
);


// --- Protected routes (assuming an `isAuthenticated` middleware) ---
// Update current user's profile (userId could be implicit from auth token)
router.put(
  '/profile', // Or '/:userId/profile' if admin can update
  // isAuthenticated, 
  validate(userValidations.updateUserProfileSchema),
  userHandlers.updateUserProfile
);

// Follow a user
router.post(
  '/:userIdToFollowOrUnfollow/follow',
  // isAuthenticated,
  validate(userValidations.followUnfollowSchema),
  userHandlers.followUser
);

// Unfollow a user
router.delete(
  '/:userIdToFollowOrUnfollow/unfollow',
  // isAuthenticated,
  validate(userValidations.followUnfollowSchema),
  userHandlers.unfollowUser
);

export default router;
