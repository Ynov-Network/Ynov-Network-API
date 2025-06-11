import type { Response } from 'express';
import type {
  CreateConversationRequest,
  GetConversationsRequest,
  GetMessagesRequest,
  SendMessageRequest,
} from './request-types';
import ConversationModel from '@/db/schemas/conversations';
import MessageModel from '@/db/schemas/messages';
import UserModel from '@/db/schemas/users';
import { io, getReceiverSocketId } from '@/lib/socket';

export const createConversation = async (req: CreateConversationRequest, res: Response) => {
  const senderId = req.auth.user.id;
  const { recipientId } = req.body;

  if (senderId === recipientId) {
    res.status(400).json({ message: "You cannot start a conversation with yourself." });
    return;
  }

  try {
    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      res.status(404).json({ message: "Recipient not found." });
      return;
    }

    let conversation = await ConversationModel.findOne({
      type: 'one_to_one',
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = new ConversationModel({
        type: 'one_to_one',
        participants: [senderId, recipientId]
      });
      await conversation.save();
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getConversationsForUser = async (req: GetConversationsRequest, res: Response) => {
  const userId = req.auth.user.id;

  try {
    const conversations = await ConversationModel.find({ participants: userId })
      .populate({
        path: 'participants',
        select: 'username profile_picture_url first_name last_name',
        match: { _id: { $ne: userId } }
      })
      .sort({ last_message_timestamp: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getMessagesForConversation = async (req: GetMessagesRequest, res: Response) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const skip = (page - 1) * limit;

  try {
    const messages = await MessageModel.find({ conversation_id: conversationId })
      .populate('sender_id', 'username profile_picture_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const sendMessage = async (req: SendMessageRequest, res: Response) => {
  const senderId = req.auth.user.id;
  const { conversationId } = req.params;
  const { content } = req.body;

  try {
    const [conversation, sender] = await Promise.all([
      ConversationModel.findById(conversationId),
      UserModel.findById(senderId).select('username profile_picture_url')
    ]);

    if (!conversation) {
      res.status(404).json({ message: "Conversation not found." });
      return;
    }
    if (!conversation.participants.includes(senderId)) {
      res.status(403).json({ message: "You are not a participant in this conversation." });
      return;
    }

    const newMessage = new MessageModel({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    });

    conversation.last_message_timestamp = new Date();

    await Promise.all([
      newMessage.save(),
      conversation.save(),
    ]);

    const messageWithSender = { ...newMessage.toObject(), sender_id: sender };

    conversation.participants.forEach(participantId => {
      const receiverSocketId = getReceiverSocketId(participantId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', messageWithSender);
      }
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}; 