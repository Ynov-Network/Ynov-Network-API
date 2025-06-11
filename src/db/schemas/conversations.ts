import { Schema, type Types, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Conversation extends Document {
  type: 'one_to_one' | 'group';
  creation_timestamp: Date;
  last_message_timestamp?: Date;
  participants: Types.Array<string>;
}

const conversationSchema = new Schema<Conversation, Model<Conversation>>({
  _id: { type: String, default: () => uuidv4() },
  type: { type: String, enum: ['one_to_one', 'group'], required: true },
  creation_timestamp: { type: Date, default: Date.now, required: true },
  last_message_timestamp: { type: Date },
  participants: [{ type: String, ref: 'User' }]
}, {
  timestamps: true,
  _id: false
});

conversationSchema.index({ last_message_timestamp: -1 });

export default model<Conversation>('Conversation', conversationSchema);