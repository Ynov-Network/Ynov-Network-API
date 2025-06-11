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
  const { recipientIds, type, groupName } = req.body;

  if (!recipientIds || recipientIds.length === 0) {
    res.status(400).json({ message: "Recipient ID(s) are required." });
    return;
  }

  const allParticipantIds = [...new Set([senderId, ...recipientIds])];

  if (type === 'one_to_one' && allParticipantIds.length !== 2) {
    res.status(400).json({ message: "One-on-one chats must have exactly two participants." });
    return;
  }

  if (type === 'group' && !groupName) {
    res.status(400).json({ message: "Group chats must have a name." });
    return;
  }

  try {
    // Check if a one-on-one conversation already exists to prevent duplicates
    if (type === 'one_to_one') {
      const existing = await ConversationModel.findOne({
        type: 'one_to_one',
        participants: { $all: allParticipantIds, $size: 2 }
      });
      if (existing) {
        res.status(200).json(existing);
        return;
      }
    }

    const conversation = new ConversationModel({
      type,
      participants: allParticipantIds,
      group_name: type === 'group' ? groupName : undefined,
      // created_by: senderId // Optional: to track who created the group
    });
    await conversation.save();

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

export const markMessagesAsRead = async (req: any, res: Response) => {
  const userId = req.auth.user.id;
  const { conversationId } = req.params;
  const { lastMessageId } = req.body;

  try {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ message: "Conversation not found." });
      return;
    }
    if (!conversation.participants.includes(userId)) {
      res.status(403).json({ message: "You are not a participant in this conversation." });
      return;
    }

    const lastMessage = await MessageModel.findById(lastMessageId);
    if (!lastMessage) {
      res.status(404).json({ message: "Message not found." });
      return;
    }

    await MessageModel.updateMany(
      {
        conversation_id: conversationId,
        createdAt: { $lte: lastMessage.createdAt },
        [`read_status.${userId}`]: { $ne: true }
      },
      { $set: { [`read_status.${userId}`]: true } }
    );

    res.status(200).json({ message: "Messages marked as read." });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}; 