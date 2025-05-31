import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Interface for embedded MediaItem (does NOT extend Document)
export interface IMediaItem {
  media_id: string; // Ref to Media._id
  display_order: number;
}

// Schema for embedded MediaItem
const MediaItemModel = new Schema<IMediaItem>({ // No Document/Model generic here
  media_id: { type: String, ref: 'Media', required: true },
  display_order: { type: Number, default: 0 },
}, { _id: false }); // Subdocuments often have _id: false unless specifically needed

// Interface for embedded AuthorInfo (does NOT extend Document)
export interface IAuthorInfo {
  user_id: string;
  username: string;
  profile_picture_url?: string;
}

// Schema for embedded AuthorInfo
const AuthorInfoModel = new Schema<IAuthorInfo>({ // No Document/Model generic here
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  profile_picture_url: { type: String },
}, { _id: false });


export interface IPost {
  author_user_id: string;
  author_info: IAuthorInfo; // Uses the plain interface
  content?: string;
  timestamp: Date;
  visibility: 'public' | 'followers_only' | 'private';
  media_items: Types.DocumentArray<IMediaItem>; // Correct typing for arrays of subdocuments
  hashtags: Types.Array<string>; // For array of string refs
  like_count: number;
  comment_count: number;
}

export interface IPostDocument extends IPost, Document { }

export interface IPostModel extends Model<IPostDocument> { }

const PostModel = new Schema<IPostDocument, IPostModel>({
  _id: { type: String, default: () => uuidv4() },
  author_user_id: { type: String, ref: 'User', required: true, index: true },
  author_info: { type: AuthorInfoModel, required: true }, // Use the schema here
  content: { type: String, maxlength: 2000 },
  timestamp: { type: Date, default: Date.now, required: true },
  visibility: {
    type: String,
    enum: ['public', 'followers_only', 'private'],
    default: 'public',
    required: true,
  },
  media_items: [MediaItemModel], // Use the schema here
  hashtags: [{ type: String, ref: 'Hashtag', index: true }],
  like_count: { type: Number, default: 0, min: 0, required: true },
  comment_count: { type: Number, default: 0, min: 0, required: true },
}, {
  timestamps: true,
  _id: false
});

PostModel.index({ author_user_id: 1, timestamp: -1 });
PostModel.index({ hashtags: 1 });

export default mongoose.model<IPostDocument, IPostModel>('Post', PostModel);