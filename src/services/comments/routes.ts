import { Router } from 'express';
import * as commentHandlers from './handlers';
import { validationMiddleware } from '../../common/middleware/validation.middleware'; // Adjust path
import {
  createCommentBodySchema,
  updateCommentBodySchema,
  getCommentsQuerySchema,
  postIdParamsSchema,
  commentIdParamsSchema
} from './validations';
// import { requireAuth } from '../../middlewares/authMiddleware'; // Example auth middleware

const router = Router();

// --- Routes for comments related to a specific post ---
// Create a comment on a post (requires authentication)
router.post(
  '/posts/:postId/comments',
  // requireAuth,
  validationMiddleware({ params: postIdParamsSchema, body: createCommentBodySchema }),
  commentHandlers.createComment
);

// Get all comments for a post (publicly accessible)
router.get(
  '/posts/:postId/comments',
  validationMiddleware({ params: postIdParamsSchema, query: getCommentsQuerySchema }),
  commentHandlers.getCommentsByPost
);

// --- Routes for managing a specific comment by its ID ---
// Update a comment (requires authentication and ownership)
router.put(
  '/comments/:commentId',
  // requireAuth,
  validationMiddleware({ params: commentIdParamsSchema, body: updateCommentBodySchema }),
  commentHandlers.updateComment
);

// Delete a comment (requires authentication and ownership/permission)
router.delete(
  '/comments/:commentId',
  // requireAuth,
  validationMiddleware({ params: commentIdParamsSchema }),
  commentHandlers.deleteComment
);

export default router;