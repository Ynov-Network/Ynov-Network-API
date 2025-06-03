import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Interface for embedded MediaItem (does NOT extend Document)
export interface MediaItem {
  media_id: string; // Ref to Media._id
  display_order: number;
}

// Schema for embedded MediaItem
const mediaItemSchema = new Schema<MediaItem>({
  media_id: { type: String, ref: 'Media', required: true },
  display_order: { type: Number, default: 0 },
}, { _id: false });

// Interface for embedded AuthorInfo (does NOT extend Document)
export interface AuthorInfo {
  user_id: string;
  username: string;
  profile_picture_url?: string;
}

// Schema for embedded AuthorInfo
const authorInfoSchema = new Schema<AuthorInfo>({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  profile_picture_url: { type: String },
}, { _id: false });

// Main Post interface extends Document
export interface Post extends Document {
  author_user_id: string;
  author_info: AuthorInfo;
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
  author_user_id: { type: String, ref: 'User', required: true, index: true },
  author_info: { type: authorInfoSchema, required: true },
  content: { type: String, maxlength: 2000 },
  timestamp: { type: Date, default: Date.now, required: true },
  visibility: {
    type: String,
    enum: ['public', 'followers_only', 'private'],
    default: 'public',
    required: true,
  },
  media_items: [mediaItemSchema],
  hashtags: [{ type: String, ref: 'Hashtag', index: true }],
  like_count: { type: Number, default: 0, min: 0, required: true },
  comment_count: { type: Number, default: 0, min: 0, required: true },
}, {
  timestamps: true,
});

postSchema.index({ author_user_id: 1, timestamp: -1 });
postSchema.index({ hashtags: 1 });

export default model<Post>('Post', postSchema);