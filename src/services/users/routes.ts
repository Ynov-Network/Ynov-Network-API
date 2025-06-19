import { Router } from 'express';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import * as userHandlers from './handlers';
import {
  updateUserSchema,
  updatePrivacySettingsSchema,
  updateProfilePictureSchema,
  getSuggestedUsersQuerySchema,
  updateNotificationSettingsSchema
} from './validations';
import followRouter from '../follow/routes';

const router = Router();

// Get own profile
router.get('/me', userHandlers.getMyProfile);

// Update own profile (text fields)
router.put('/me', validationMiddleware({ body: updateUserSchema }), userHandlers.updateUserProfile);

// Update profile picture
// If using multipart/form-data, you'll need multer middleware here before the handler.
// For base64, validationMiddleware can be used if schema expects a string.
router.post('/me/profile-picture', validationMiddleware({ body: updateProfilePictureSchema }), userHandlers.updateProfilePicture);

// Update privacy settings
router.put('/me/privacy', validationMiddleware({ body: updatePrivacySettingsSchema }), userHandlers.updatePrivacySettings);

// Update notification settings
router.put('/me/notification-settings', validationMiddleware({ body: updateNotificationSettingsSchema }), userHandlers.updateNotificationSettings);

// Delete own profile
router.delete('/me', userHandlers.deleteUser);

// Get suggested users for the logged-in user
router.get('/suggestions', validationMiddleware({ query: getSuggestedUsersQuerySchema }), userHandlers.getSuggestedUsers);

// Mount follow routes. They are already scoped to /:userId
router.use('/', followRouter);

// Get specific user's liked posts
router.get('/:userId/liked', userHandlers.getLikedPostsByUser);

// Get specific user's profile (public)
router.get('/:userId', userHandlers.getUserProfile);

export default router;