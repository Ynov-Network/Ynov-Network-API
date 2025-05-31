import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IConversation {
  type: 'one_to_one' | 'group';
  creation_timestamp: Date;
  last_message_timestamp?: Date;
  // participants: Types.Array<string>; // If you decide to embed participant user_ids directly
}

export interface IConversationDocument extends IConversation, Document { }

export interface IConversationModel extends Model<IConversationDocument> { }

const ConversationModel = new Schema<IConversationDocument, IConversationModel>({
  _id: { type: String, default: () => uuidv4() },
  type: { type: String, enum: ['one_to_one', 'group'], required: true },
  creation_timestamp: { type: Date, default: Date.now, required: true },
  last_message_timestamp: { type: Date },
  // participants: [{ type: String, ref: 'User' }] // If embedding
}, {
  timestamps: true,
  _id: false
});

// Index for querying conversations by last message (e.g., for sorting recent chats)
ConversationModel.index({ last_message_timestamp: -1 });

export default mongoose.model<IConversationDocument, IConversationModel>('Conversation', ConversationModel);