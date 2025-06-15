import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface MediaItem {
  _id: Types.ObjectId;
  media_id: Types.ObjectId;
  display_order: number;
  createdAt: Date;
  updatedAt: Date;
}

const mediaItemSchema = new Schema<MediaItem>({
  media_id: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
  display_order: { type: Number, default: 0 },
}, { timestamps: true });

export interface Post extends Document {
  _id: Types.ObjectId;
  author_id: Types.ObjectId;
  content?: string;
  timestamp: Date;
  visibility: 'public' | 'followers_only' | 'private';
  media_items: Types.DocumentArray<MediaItem>;
  hashtags: Types.Array<Types.ObjectId>;
  like_count: number;
  comment_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<Post, Model<Post>>({
  author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, maxlength: 2000 },
  timestamp: { type: Date, default: Date.now, required: true },
  visibility: {
    type: String,
    enum: ['public', 'followers_only', 'private'],
    default: 'public',
    required: true,
  },
  media_items: [mediaItemSchema],
  hashtags: [{ type: Schema.Types.ObjectId, ref: 'Hashtag' }],
  like_count: { type: Number, default: 0, min: 0, required: true },
  comment_count: { type: Number, default: 0, min: 0, required: true },
}, {
  timestamps: true,
});

postSchema.index({ author_id: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

export default model<Post>('Post', postSchema);