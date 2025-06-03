import { Schema, model, type Model, type Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Session extends Document {
  user_id: string;
  token: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
}

const sessionSchema = new Schema<Session, Model<Session>>({
  _id: { type: String, default: () => uuidv4() },
  expires_at: { type: Date, required: true },
  token: { type: String, required: true, unique: true },
  user_id: { type: String, ref: 'User', required: true, index: true },
  ip_address: { type: String },
  user_agent: { type: String },
}, {
  timestamps: true,
  _id: false,
});

// TTL index for automatic deletion of expired sessions
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default model<Session>('Session', sessionSchema);