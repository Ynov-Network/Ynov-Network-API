import { z } from 'zod/v4';

export const groupIdParamsSchema = z.object({
  groupId: z.string(),
});
export type GroupIdParams = z.infer<typeof groupIdParamsSchema>;

export const createGroupBodySchema = z.strictObject({
  name: z.string().min(3, "Name must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500),
  topic: z.enum(['Web Development', 'AI', 'CyberSecurity', 'Data Analytics', 'Games Development']),
  is_public: z.boolean().default(true),
  cover_image_url: z.string().url().optional(),
});
export type CreateGroupBody = z.infer<typeof createGroupBodySchema>;

export const updateGroupBodySchema = createGroupBodySchema.partial().pick({
  description: true,
  is_public: true,
  cover_image_url: true,
});
export type UpdateGroupBody = z.infer<typeof updateGroupBodySchema>;

export const getGroupsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  topic: z.enum(['Web Development', 'AI', 'CyberSecurity', 'Data Analytics', 'Games Development']).optional(),
  q: z.string().optional(),
});
export type GetGroupsQuery = z.infer<typeof getGroupsQuerySchema>; 