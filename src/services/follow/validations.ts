import { z } from 'zod/v4';

export const userIdParamSchema = z.object({
  userId: z.string().min(1, "User ID cannot be empty."),
});
export type UserIdParamSchema = z.infer<typeof userIdParamSchema>; 

export const getFollowsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type GetFollowsRequestQuery = z.infer<typeof getFollowsQuerySchema>; 