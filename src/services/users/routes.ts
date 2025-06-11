import { Router } from 'express';
import { protectRoute } from '@/common/middleware/auth.middleware';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import * as userHandlers from './handlers';
import { updateUserSchema, updatePrivacySettingsSchema, updateProfilePictureSchema } from './validations';
import followRouter from '../follow/routes';

const router = Router();

// Get own profile
router.get('/me', protectRoute, userHandlers.getMyProfile);

// Update own profile (text fields)
router.put('/me', protectRoute, validationMiddleware({ body: updateUserSchema }), userHandlers.updateUserProfile);

// Update profile picture
// If using multipart/form-data, you'll need multer middleware here before the handler.
// For base64, validationMiddleware can be used if schema expects a string.
router.post('/me/profile-picture', protectRoute, validationMiddleware({ body: updateProfilePictureSchema }), userHandlers.updateProfilePicture);

// Update privacy settings
router.put('/me/privacy', protectRoute, validationMiddleware({ body: updatePrivacySettingsSchema }), userHandlers.updatePrivacySettings);

// Delete own profile
router.delete('/me', protectRoute, userHandlers.deleteUser);

// Mount follow routes. They are already scoped to /:userId
router.use('/', followRouter);

// Get specific user's profile (public)
router.get('/:userId', userHandlers.getUserProfile); // protectRoute might be conditional based on privacy

export default router;