import { z } from 'zod/v4';

export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  filter: z.enum(['all', 'unread']).optional().default('all'),
});
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;

export const notificationIdParamsSchema = z.object({
  notificationId: z.string().min(1, "Notification ID cannot be empty."),
}); 
export type NotificationIdParams = z.infer<typeof notificationIdParamsSchema>;