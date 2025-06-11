import { Router } from 'express';
import * as messageHandlers from './handlers';
import { protectRoute } from '@/common/middleware/auth.middleware';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  conversationIdParamSchema,
  sendMessageBodySchema,
  createConversationBodySchema,
  getMessagesQuerySchema,
  getConversationsQuerySchema,
} from './validations';

const router = Router();

// Get all conversations for the logged-in user
router.get(
  '/',
  protectRoute,
  validationMiddleware({ query: getConversationsQuerySchema }),
  messageHandlers.getConversationsForUser
);

// Create a new one-on-one conversation
router.post(
  '/',
  protectRoute,
  validationMiddleware({ body: createConversationBodySchema }),
  messageHandlers.createConversation
);

// Get messages for a specific conversation
router.get(
  '/:conversationId/messages',
  protectRoute,
  validationMiddleware({ params: conversationIdParamSchema, query: getMessagesQuerySchema }),
  messageHandlers.getMessagesForConversation
);

// Send a message to a specific conversation
router.post(
  '/:conversationId/messages',
  protectRoute,
  validationMiddleware({ params: conversationIdParamSchema, body: sendMessageBodySchema }),
  messageHandlers.sendMessage
);

export default router; 