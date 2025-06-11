import { z } from 'zod/v4';

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty.').max(100),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(15),
  // Optional filter for what to search for
  type: z.enum(['users', 'hashtags', 'all']).optional().default('all'),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>; 