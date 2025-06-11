import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationParticipant extends Document {
  conversation_id: string;
  user_id: string;
  joined_timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationParticipantSchema = new Schema<ConversationParticipant, Model<ConversationParticipant>>({
  _id: { type: String, default: () => uuidv4() },
  conversation_id: { type: String, ref: 'Conversation', required: true },
  user_id: { type: String, ref: 'User', required: true },
  joined_timestamp: { type: Date, default: Date.now, required: true },
}, {
  timestamps: true,
  _id: false
});

conversationParticipantSchema.index({ conversation_id: 1, user_id: 1 }, { unique: true });
conversationParticipantSchema.index({ user_id: 1, conversation_id: 1 });
conversationParticipantSchema.index({ conversation_id: 1 });

export default model<ConversationParticipant>('ConversationParticipant', conversationParticipantSchema);