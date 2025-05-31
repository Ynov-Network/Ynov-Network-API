import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_timestamp: Date;
}

export interface IConversationParticipantDocument extends IConversationParticipant, Document { }

export interface IConversationParticipantModel extends Model<IConversationParticipantDocument> { }

const ConversationParticipantModel = new Schema<IConversationParticipantDocument, IConversationParticipantModel>({
  _id: { type: String, default: () => uuidv4() },
  conversation_id: { type: String, ref: 'Conversation', required: true },
  user_id: { type: String, ref: 'User', required: true },
  joined_timestamp: { type: Date, default: Date.now, required: true },
}, {
  timestamps: true,
  _id: false
});

ConversationParticipantModel.index({ conversation_id: 1, user_id: 1 }, { unique: true });
ConversationParticipantModel.index({ user_id: 1, conversation_id: 1 }); // Useful for finding user's conversations
ConversationParticipantModel.index({ conversation_id: 1 });

export default mongoose.model<IConversationParticipantDocument, IConversationParticipantModel>('ConversationParticipant', ConversationParticipantModel);