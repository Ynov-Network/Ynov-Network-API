import { Router } from 'express';
import * as messageHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  conversationIdParamSchema,
  sendMessageBodySchema,
  createConversationBodySchema,
  getMessagesQuerySchema,
  getConversationsQuerySchema,
  markReadBodySchema,
} from './validations';

const router = Router();

// Get all conversations for the logged-in user
router.get(
  '/',
  validationMiddleware({ query: getConversationsQuerySchema }),
  messageHandlers.getConversationsForUser
);

// Create a new one-on-one conversation
router.post(
  '/',
  validationMiddleware({ body: createConversationBodySchema }),
  messageHandlers.createConversation
);

// Get messages for a specific conversation
router.get(
  '/:conversationId/messages',
  validationMiddleware({ params: conversationIdParamSchema, query: getMessagesQuerySchema }),
  messageHandlers.getMessagesForConversation
);

// Send a message to a specific conversation
router.post(
  '/:conversationId/messages',
  validationMiddleware({ params: conversationIdParamSchema, body: sendMessageBodySchema }),
  messageHandlers.sendMessage
);

// Mark messages in a conversation as read
router.put(
  '/:conversationId/read',
  validationMiddleware({ params: conversationIdParamSchema, body: markReadBodySchema }),
  messageHandlers.markMessagesAsRead
);

export default router; 