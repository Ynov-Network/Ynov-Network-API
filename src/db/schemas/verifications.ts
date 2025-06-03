import { type Model, Schema, model, type Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Verification extends Document {
  _id: string;
  identifier: string;
  value: string;
  expires_at: Date;
}

const verificationSchema = new Schema<Verification, Model<Verification>>({
  _id: { type: String, default: () => uuidv4() },
  identifier: { type: String, required: true }, 
  value: { type: String, required: true }, 
  expires_at: { type: Date, required: true },
}, {
  timestamps: true,
  _id: false,
});

verificationSchema.index({ identifier: 1, value: 1 });
verificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default model<Verification>('Verification', verificationSchema);