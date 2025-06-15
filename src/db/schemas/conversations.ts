import { Schema, type Types, model, type Document, type Model } from 'mongoose';

export interface Conversation extends Document {
  _id: Types.ObjectId;
  type: 'one_to_one' | 'group';
  last_message_timestamp?: Date;
  participants: Types.Array<Types.ObjectId>;
  group_name?: string;
  group_admin?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<Conversation, Model<Conversation>>({
  type: { type: String, enum: ['one_to_one', 'group'], required: true },
  last_message_timestamp: { type: Date },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  group_name: { type: String, trim: true },
  group_admin: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

conversationSchema.index({ last_message_timestamp: -1 });

export default model<Conversation>('Conversation', conversationSchema);