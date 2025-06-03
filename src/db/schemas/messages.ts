import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Message extends Document {
  conversation_id: string;
  sender_id?: string;
  content: string;
  read_status: Map<string, Date | boolean | string>;
}

const messageSchema = new Schema<Message, Model<Message>>({
  _id: { type: String, default: () => uuidv4() },
  conversation_id: { type: String, ref: 'Conversation', required: true },
  sender_id: { type: String, ref: 'User', default: null },
  content: { type: String, required: true, maxlength: 5000 },
  read_status: { 
    type: Map, 
    of: Schema.Types.Mixed, 
    default: new Map 
  },
}, {
  timestamps: true,
  _id: false
});

messageSchema.index({ conversation_id: 1, timestamp: -1 }); 

export default model<Message>('Message', messageSchema);