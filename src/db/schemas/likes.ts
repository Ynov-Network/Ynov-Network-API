import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ILike {
  post_id: string;
  user_id: string;
  timestamp: Date;
}

export interface ILikeDocument extends ILike, Document { }

export interface ILikeModel extends Model<ILikeDocument> { }

const LikeModel = new Schema<ILikeDocument, ILikeModel>({
  _id: { type: String, default: () => uuidv4() },
  post_id: { type: String, ref: 'Post', required: true },
  user_id: { type: String, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now, required: true },
}, {
  timestamps: true,
  _id: false
});

LikeModel.index({ post_id: 1, user_id: 1 }, { unique: true });
LikeModel.index({ post_id: 1 });
LikeModel.index({ user_id: 1 });

export default mongoose.model<ILikeDocument, ILikeModel>('Like', LikeModel);