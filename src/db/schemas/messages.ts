import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMessage {
  conversation_id: string;
  sender_user_id?: string;
  content: string;
  timestamp: Date;
  read_status: Map<string, Date | boolean | string>;
}

export interface IMessageDocument extends IMessage, Document { }

export interface IMessageModel extends Model<IMessageDocument> { }

const MessageModel = new Schema<IMessageDocument, IMessageModel>({
  _id: { type: String, default: () => uuidv4() },
  conversation_id: { type: String, ref: 'Conversation', required: true },
  sender_user_id: { type: String, ref: 'User', default: null },
  content: { type: String, required: true, maxlength: 5000 },
  timestamp: { type: Date, default: Date.now, required: true },
  read_status: { 
    type: Map, 
    of: Schema.Types.Mixed, 
    default: new Map 
  },
}, {
  timestamps: true,
  _id: false
});

MessageModel.index({ conversation_id: 1, timestamp: -1 }); // Primary query for messages in a conversation

export default mongoose.model<IMessageDocument, IMessageModel>('Message', MessageModel);