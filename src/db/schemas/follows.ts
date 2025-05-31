import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// 1. Base Interface
export interface IFollow {
  follower_id: string; // User ID of the one who is following
  following_id: string; // User ID of the one who is being followed
  created_at: Date;
}

// 2. Document Interface
export interface IFollowDocument extends IFollow, Document { }

// 3. Model Interface
export interface IFollowModel extends Model<IFollowDocument> { }

const FollowSchema = new Schema<IFollowDocument, IFollowModel>({
  _id: { type: String, default: () => uuidv4() },
  follower_id: { type: String, ref: 'User', required: true },
  following_id: { type: String, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }, // Only manage created_at
  _id: false,
  versionKey: false,
});

FollowSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });
FollowSchema.index({ follower_id: 1 });
FollowSchema.index({ following_id: 1 });

const FollowModel = mongoose.model<IFollowDocument, IFollowModel>('Follow', FollowSchema);

export default FollowModel;