import { z } from 'zod/v4';

export const postIdParamsSchema = z.object({
  postId: z.string().min(1, "Post ID cannot be empty."),
});

export const getLikesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type PostIdParams = z.infer<typeof postIdParamsSchema>;