import { z } from 'zod/v4';

export const getHashtagsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  sortBy: z.enum(['popular', 'recent']).optional().default('popular'),
});
export type GetHashtagsQuery = z.infer<typeof getHashtagsQuerySchema>;

export const tagNameParamsSchema = z.object({
  tagName: z.string().min(1, "Hashtag cannot be empty."),
});
export type TagNameParams = z.infer<typeof tagNameParamsSchema>;

export const getPostsByHashtagQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});
export type GetPostsByHashtagQuery = z.infer<typeof getPostsByHashtagQuerySchema>; 