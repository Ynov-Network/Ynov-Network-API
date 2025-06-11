import { z } from 'zod/v4';

// For GET /conversations/:conversationId/messages
export const conversationIdParamSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID cannot be empty."),
});
export type ConversationIdParams = z.infer<typeof conversationIdParamSchema>;

// For POST /conversations/:conversationId/messages
export const sendMessageBodySchema = z.strictObject({
  content: z.string().min(1).max(5000),
});
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;

// For POST /conversations
export const createConversationBodySchema = z.strictObject({
  recipientId: z.string().min(1, "Recipient ID cannot be empty."),
});
export type CreateConversationBody = z.infer<typeof createConversationBodySchema>;

// For GET queries
export const getMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(30),
});
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;

export const getConversationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});
export type GetConversationsQuery = z.infer<typeof getConversationsQuerySchema>; 