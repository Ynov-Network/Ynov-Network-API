import { z } from 'zod/v4';

const attachmentSchema = z.object({
  filename: z.string().optional(),
  content: z.any().optional(),
  path: z.string().optional(),
  contentType: z.string().optional(),
  cid: z.string().optional(),
});

export const sendMailOptionsSchema = z.object({
  to: z.email({ message: "Invalid email address" }),
  subject: z.string().min(1, { message: "Subject cannot be empty" }), 
  html: z.string().min(1, { message: "HTML content cannot be empty" }),
  attachments: z.array(attachmentSchema).optional()
}).strict();