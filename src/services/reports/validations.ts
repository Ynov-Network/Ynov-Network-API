import { z } from 'zod/v4';

export const createReportBodySchema = z.strictObject({
  reported_entity_type: z.enum(['Post', 'Comment', 'User']),
  reported_entity_id: z.string().min(1, 'Entity ID cannot be empty.'),
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters).').max(1000),
});
export type CreateReportBody = z.infer<typeof createReportBodySchema>; 