import { z } from 'zod/v4';

export const postIdParamsSchema = z.object({
  postId: z.string().min(1, "Post ID cannot be empty."), // Assuming IDs are strings (like UUIDs from your models)
});
export type PostIdParams = z.infer<typeof postIdParamsSchema>;

const mediaItemSchemaValidation = z.object({
  media_id: z.string().min(1, "Media ID cannot be empty."),
  display_order: z.number().int().min(0).default(0),
});
export type MediaItemSchemaValidation = z.infer<typeof mediaItemSchemaValidation>;

export const createPostBodySchema = z.strictObject({
  content: z.string().max(2000),
  visibility: z.enum(['public', 'followers_only', 'private']).default('public'),
  media_items: z.array(mediaItemSchemaValidation).max(10).optional().default([]), // Max 10 media items for example
  hashtags: z.array(z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/, "Hashtags can only contain letters, numbers, and underscores.")).max(10).optional().default([]),
});
export type CreatePostRequestBody = z.infer<typeof createPostBodySchema>;

export const updatePostBodySchema = z.strictObject({
  content: z.string().max(2000).optional(),
  visibility: z.enum(['public', 'followers_only', 'private']).optional(),
  media_items: z.array(mediaItemSchemaValidation).max(10).optional(),
  hashtags: z.array(z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/, "Hashtags can only contain letters, numbers, and underscores.")).max(10).optional(),
});
export type UpdatePostRequestBody = z.infer<typeof updatePostBodySchema>;
