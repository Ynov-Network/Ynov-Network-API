import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { type IAuthorInfo } from './posts'; // Re-use IAuthorInfo interface

// Base interface
export interface IComment {
  post_id: string;
  author_user_id: string;
  author_info: IAuthorInfo; // Use the plain interface
  content: string;
  timestamp: Date;
}

// Document interface
export interface ICommentDocument extends IComment, Document { }

// Model interface
export interface ICommentModel extends Model<ICommentDocument> { }

// Re-use AuthorInfoSchema from post.model.ts or redefine if preferred for separation
const AuthorInfoModelForComment = new Schema<IAuthorInfo>({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  profile_picture_url: { type: String },
}, { _id: false });


const CommentModel = new Schema<ICommentDocument, ICommentModel>({
  _id: { type: String, default: () => uuidv4() },
  post_id: { type: String, ref: 'Post', required: true },
  author_user_id: { type: String, ref: 'User', required: true },
  author_info: { type: AuthorInfoModelForComment, required: true },
  content: { type: String, required: true, maxlength: 1000 },
  timestamp: { type: Date, default: Date.now, required: true },
}, {
  timestamps: true,
  _id: false
});

CommentModel.index({ post_id: 1, timestamp: 1 });
CommentModel.index({ author_user_id: 1 });

export default mongoose.model<ICommentDocument, ICommentModel>('Comment', CommentModel);