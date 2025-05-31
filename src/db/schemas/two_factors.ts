import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITwoFactor extends Document {
  _id: string;
  secret: string;
  backup_codes: string[]; // IMPORTANT: These should be HASHED before storing
  user_id: string;
}

const TwoFactorModel = new Schema<ITwoFactor>({
  _id: { type: String, default: () => uuidv4() },
  secret: { type: String, required: true }, // TOTP secret
  backup_codes: [{ type: String, required: true }], // Store HASHED backup codes
  user_id: { type: String, ref: 'User', required: true, unique: true },
}, {
  timestamps: true,
  _id: false,
});

export default mongoose.model<ITwoFactor>('TwoFactor', TwoFactorModel);