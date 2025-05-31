import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IVerification extends Document {
  _id: string;
  identifier: string;
  value: string; // Should be hashed if it's a long-lived token
  expires_at: Date;
  // createdAt, updatedAt from timestamps
}

const VerificationModel = new Schema<IVerification>({
  _id: { type: String, default: () => uuidv4() },
  identifier: { type: String, required: true }, // e.g., email or phone number
  value: { type: String, required: true }, // The token/code. Consider hashing.
  expires_at: { type: Date, required: true },
}, {
  timestamps: true,
  _id: false,
});

VerificationModel.index({ identifier: 1, value: 1 }); // If you query by both
// TTL index for automatic deletion of expired verification tokens
VerificationModel.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IVerification>('Verification', VerificationModel);