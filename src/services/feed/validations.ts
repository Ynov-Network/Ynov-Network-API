import { z } from 'zod/v4';

export const getFeedQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  // Future extension: sort by 'relevance' or 'top'
  // sortBy: z.enum(['latest', 'relevance']).optional().default('latest'),
});

export type GetFeedQuery = z.infer<typeof getFeedQuerySchema>; 