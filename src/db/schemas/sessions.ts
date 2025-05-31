import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISession extends Document {
  _id: string;
  expires_at: Date;
  token: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  impersonated_by?: string;
  // createdAt, updatedAt from timestamps
}

const SessionModel = new Schema<ISession>({
  _id: { type: String, default: () => uuidv4() },
  expires_at: { type: Date, required: true },
  token: { type: String, required: true, unique: true },
  user_id: { type: String, ref: 'User', required: true, index: true },
  ip_address: { type: String },
  user_agent: { type: String },
  impersonated_by: { type: String, ref: 'User' },
}, {
  timestamps: true,
  _id: false,
});

// TTL index for automatic deletion of expired sessions
SessionModel.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISession>('Session', SessionModel);