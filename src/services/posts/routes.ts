import { Router } from 'express';
import * as postHandlers from './handlers';
import { validationMiddleware } from '../../common/middleware/validation.middleware'; // Adjust path
import {
	createPostBodySchema,
	updatePostBodySchema,
	postIdParamsSchema
} from './validations';
// Assuming an authMiddleware that populates req.user
// import { requireAuth } from '../../middlewares/authMiddleware'; // Example auth middleware

const router = Router();

// Create a new post (requires authentication)
router.post(
	'/',
	// requireAuth, // Apply authentication middleware
	validationMiddleware({ body: createPostBodySchema }),
	postHandlers.createPost
);

// Get a specific post by ID (publicly accessible, or add auth if needed for private posts)
router.get(
	'/:postId',
	validationMiddleware({ params: postIdParamsSchema }),
	postHandlers.getPostById
);

// Update an existing post (requires authentication and ownership)
router.put(
	'/:postId',
	// requireAuth,
	validationMiddleware({ params: postIdParamsSchema, body: updatePostBodySchema }),
	postHandlers.updatePost
);

// Delete a post (requires authentication and ownership)
router.delete(
	'/:postId',
	// requireAuth,
	validationMiddleware({ params: postIdParamsSchema }),
	postHandlers.deletePost
);

export default router;