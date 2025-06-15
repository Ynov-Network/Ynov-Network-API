import { z } from 'zod/v4';

export const getReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  status: z.enum(['pending', 'resolved_action_taken', 'resolved_no_action', 'dismissed']).optional(),
});
export type GetReportsQuery = z.infer<typeof getReportsQuerySchema>;

export const reportIdParamsSchema = z.object({
  reportId: z.string().min(1, "Report ID cannot be empty."),
});
export type ReportIdParams = z.infer<typeof reportIdParamsSchema>;

export const updateReportStatusBodySchema = z.strictObject({
  status: z.enum(['resolved_action_taken', 'resolved_no_action', 'dismissed']),
  admin_notes: z.string().max(2000).optional(),
});
export type UpdateReportStatusBody = z.infer<typeof updateReportStatusBodySchema>; 