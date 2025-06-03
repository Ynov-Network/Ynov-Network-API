import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface TwoFactor extends Document {
  _id: string;
  secret: string;
  backup_codes: string[]; 
  user_id: string;
}

const twoFactorSchema = new Schema<TwoFactor, Model<TwoFactor>>({
  _id: { type: String, default: () => uuidv4() },
  secret: { type: String, required: true }, 
  backup_codes: [{ type: String, required: true }],
  user_id: { type: String, ref: 'User', required: true, unique: true },
}, {
  timestamps: true,
  _id: false,
});

export default model<TwoFactor>('TwoFactor', twoFactorSchema);