import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Message extends Document {
  _id: Types.ObjectId;
  conversation_id: Types.ObjectId;
  sender_id?: Types.ObjectId;
  content: string;
  read_status: Map<string, Date | boolean | string>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<Message, Model<Message>>({
  conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  content: { type: String, required: true, maxlength: 5000 },
  read_status: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map
  },
}, {
  timestamps: true,
});

messageSchema.index({ conversation_id: 1, createdAt: -1 });

export default model<Message>('Message', messageSchema);