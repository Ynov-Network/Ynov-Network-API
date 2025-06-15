import { Router } from 'express';
import * as postHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware'; // Adjust path
import {
	createPostBodySchema,
	updatePostBodySchema,
	postIdParamsSchema,
	userIdParamsSchema,
	getPostsByUserQuerySchema
} from './validations';

const router = Router();

// Create a new post (requires authentication)
router.post(
	'/',
	validationMiddleware({ body: createPostBodySchema }),
	postHandlers.createPost
);

// Get a specific post by ID (publicly accessible, or add auth if needed for private posts)
router.get(
	'/:postId',
	validationMiddleware({ params: postIdParamsSchema }),
	postHandlers.getPostById
);

// Get all posts by a specific user
router.get(
	'/user/:userId',
	validationMiddleware({ params: userIdParamsSchema }), // You'll need to create a userId schema or reuse
	validationMiddleware({ query: getPostsByUserQuerySchema }),
	postHandlers.getPostsByUser
);

// Update an existing post (requires authentication and ownership)
router.put(
	'/:postId',
	validationMiddleware({ params: postIdParamsSchema, body: updatePostBodySchema }),
	postHandlers.updatePost
);

// Delete a post (requires authentication and ownership)
router.delete(
	'/:postId',
	validationMiddleware({ params: postIdParamsSchema }),
	postHandlers.deletePost
);

export default router;