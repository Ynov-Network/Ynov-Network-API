import { z } from 'zod/v4';

export const objectIdStringSchema = z.string().uuid('Invalid user ID format');

export const searchUsersQuerySchema = z.object({
  username: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});
