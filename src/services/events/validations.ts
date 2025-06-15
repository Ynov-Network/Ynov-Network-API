import { z } from 'zod/v4';

export const eventIdParamsSchema = z.object({
  eventId: z.string(),
});
export type EventIdParams = z.infer<typeof eventIdParamsSchema>;

export const createEventBodySchema = z.strictObject({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100),
  description: z.string().min(10, "Description must be at least 10 characters.").max(2000),
  event_type: z.enum(['Workshop', 'Competition', 'Bootcamp', 'Seminar', 'Social']),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  location: z.string().min(3, "Location is required.").max(200),
  participant_limit: z.number().int().positive().optional(),
  cover_image_url: z.string().url().optional(),
}).refine(data => data.end_date > data.start_date, {
  message: "End date must be after start date.",
  path: ["end_date"],
});
export type CreateEventBody = z.infer<typeof createEventBodySchema>;

export const updateEventBodySchema = createEventBodySchema.partial();
export type UpdateEventBody = z.infer<typeof updateEventBodySchema>;

export const getEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  event_type: z.enum(['Workshop', 'Competition', 'Bootcamp', 'Seminar', 'Social']).optional(),
  sortBy: z.enum(['start_date', 'createdAt']).optional().default('start_date'),
  q: z.string().optional(),
});
export type GetEventsQuery = z.infer<typeof getEventsQuerySchema>; 