import { Router } from 'express';
import * as commentHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  createCommentBodySchema,
  updateCommentBodySchema,
  getCommentsQuerySchema,
  postIdParamsSchema,
  commentIdParamsSchema
} from './validations';

const router = Router();

// Create a comment on a post (requires authentication)
router.post(
  '/posts/:postId/comments',
  validationMiddleware({ params: postIdParamsSchema, body: createCommentBodySchema }),
  commentHandlers.createComment
);

// Get all comments for a post (publicly accessible)
router.get(
  '/posts/:postId/comments',
  validationMiddleware({ params: postIdParamsSchema, query: getCommentsQuerySchema }),
  commentHandlers.getCommentsByPost
);

// Update a comment (requires authentication and ownership)
router.put(
  '/comments/:commentId',
  validationMiddleware({ params: commentIdParamsSchema, body: updateCommentBodySchema }),
  commentHandlers.updateComment
);

// Delete a comment (requires authentication and ownership/permission)
router.delete(
  '/comments/:commentId',
  validationMiddleware({ params: commentIdParamsSchema }),
  commentHandlers.deleteComment
);

export default router;