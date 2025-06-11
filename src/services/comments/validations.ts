import { z } from 'zod/v4';

// For POST /posts/:postId/comments
export const postIdParamsSchema = z.object({
  postId: z.string().min(1, "Post ID cannot be empty."),
});
export type PostIdParams = z.infer<typeof postIdParamsSchema>;

// For PUT/DELETE /comments/:commentId
export const commentIdParamsSchema = z.object({
  commentId: z.string().min(1, "Comment ID cannot be empty."),
});
export type CommentIdParams = z.infer<typeof commentIdParamsSchema>;

export const createCommentBodySchema = z.strictObject({
  content: z.string().min(1, "Comment content cannot be empty.").max(1000, "Comment cannot exceed 1000 characters."),
  // author_id will be derived from the authenticated user
  // post_id will be derived from the route parameter :postId
  // parent_comment_id: z.string().min(1).optional(), // For threaded comments (optional feature)
});
export type CreateCommentRequestBody = z.infer<typeof createCommentBodySchema>;

export const updateCommentBodySchema = z.strictObject({
  content: z.string().min(1, "Comment content cannot be empty.").max(1000, "Comment cannot exceed 1000 characters."),
});
export type UpdateCommentRequestBody = z.infer<typeof updateCommentBodySchema>;

export const getCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  // sortBy: z.enum(['timestamp_asc', 'timestamp_desc']).optional().default('timestamp_desc'), // For sorting
});
export type GetCommentsRequestQuery = z.infer<typeof getCommentsQuerySchema>;