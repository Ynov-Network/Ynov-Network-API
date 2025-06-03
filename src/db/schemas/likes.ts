import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Like extends Document {
  post_id: string;
  user_id: string;
}

const likeSchema = new Schema<Like, Model<Like>>({
  _id: { type: String, default: () => uuidv4() },
  post_id: { type: String, ref: 'Post', required: true },
  user_id: { type: String, ref: 'User', required: true },
}, {
  timestamps: true,
  _id: false
});

likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });
likeSchema.index({ post_id: 1 });
likeSchema.index({ user_id: 1 });

export default model<Like>('Like', likeSchema);