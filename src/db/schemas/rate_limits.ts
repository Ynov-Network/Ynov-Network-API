import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRateLimit extends Document {
  _id: string; // was id
  key?: string; // The identifier for what is being rate-limited (e.g., IP, user_id, action_type)
  count?: number;
  last_request?: Date; // Changed from integer to Date
}

const RateLimitModel = new Schema<IRateLimit>({
  _id: { type: String, default: () => uuidv4() },
  key: { type: String, index: true, unique: true }, // Key should likely be unique
  count: { type: Number, default: 0 },
  last_request: { type: Date, default: Date.now },
}, {
  timestamps: true, // For knowing when the rate limit record itself was created/updated
  _id: false,
});

// TTL index for automatic expiration of rate limit records
RateLimitModel.index({ last_request: 1 }, { expireAfterSeconds: 3600 }); // Example: expires 1 hour after last_request

export default mongoose.model<IRateLimit>('RateLimit', RateLimitModel);