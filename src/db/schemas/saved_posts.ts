import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface SavedPost extends Document {
  user_id: string;
  post_id: string;
}

const savedPostSchema = new Schema<SavedPost, Model<SavedPost>>({
  _id: { type: String, default: () => uuidv4() },
  user_id: { type: String, ref: 'User', required: true },
  post_id: { type: String, ref: 'Post', required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
  _id: false,
  versionKey: false,
});

savedPostSchema.index({ user_id: 1, post_id: 1 }, { unique: true });
savedPostSchema.index({ user_id: 1, created_at: -1 });

export default model<SavedPost>('SavedPost', savedPostSchema); 