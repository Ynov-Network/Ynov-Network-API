import { Schema, model, type Document, type Model, type Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface MediaItem {
  media_id: string; // Ref to Media._id
  display_order: number;
}

const mediaItemSchema = new Schema<MediaItem>({
  media_id: { type: String, ref: 'Media', required: true },
  display_order: { type: Number, default: 0 },
}, { _id: false });

export interface Post extends Document {
  author_id: string;
  content?: string;
  timestamp: Date;
  visibility: 'public' | 'followers_only' | 'private';
  media_items: Types.DocumentArray<MediaItem>;
  hashtags: Types.Array<string>;
  like_count: number;
  comment_count: number;
}

const postSchema = new Schema<Post, Model<Post>>({
  _id: { type: String, default: () => uuidv4() },
  author_id: { type: String, ref: 'User', required: true, index: true },
  content: { type: String, maxlength: 2000 },
  timestamp: { type: Date, default: Date.now, required: true },
  visibility: {
    type: String,
    enum: ['public', 'followers_only', 'private'],
    default: 'public',
    required: true,
  },
  media_items: [mediaItemSchema],
  hashtags: [{ type: String, ref: 'Hashtag' }],
  like_count: { type: Number, default: 0, min: 0, required: true },
  comment_count: { type: Number, default: 0, min: 0, required: true },
}, {
  timestamps: true,
});

postSchema.index({ author_user_id: 1, timestamp: -1 });
postSchema.index({ hashtags: 1 });

export default model<Post>('Post', postSchema);