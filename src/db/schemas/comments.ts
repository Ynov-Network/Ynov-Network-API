import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Base interface
export interface Comment extends Document {
  post_id: string;
  author_id: string;
  content: string;
  timestamp: Date;
}

const commentSchema = new Schema<Comment, Model<Comment>>({
  _id: { type: String, default: () => uuidv4() },
  post_id: { type: String, ref: 'Post', required: true },
  author_id: { type: String, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
}, {
  timestamps: true,
});

commentSchema.index({ post_id: 1, timestamp: 1 });
commentSchema.index({ author_user_id: 1 });

export default model<Comment>('Comment', commentSchema);