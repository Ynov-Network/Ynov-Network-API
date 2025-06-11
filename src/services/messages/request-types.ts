import type { Request } from "express";
import type {
  SendMessageBody,
  CreateConversationBody,
  ConversationIdParams,
} from "./validations";

// POST /conversations
export interface CreateConversationRequest extends Request {
  body: CreateConversationBody;
}

// GET /conversations
export interface GetConversationsRequest extends Request {
  query: {
    page?: string;
    limit?: string;
  }
}

// GET /conversations/:conversationId/messages
export interface GetMessagesRequest extends Request {
  params: ConversationIdParams;
  query: {
    page?: string;
    limit?: string;
  }
};

// POST /conversations/:conversationId/messages
export interface SendMessageRequest extends Request {
  params: ConversationIdParams;
  body: SendMessageBody;
}