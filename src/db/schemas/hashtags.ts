import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IHashtag {
  tag_name: string;
  post_count: number;
}

export interface IHashtagDocument extends IHashtag, Document { }

export interface IHashtagModel extends Model<IHashtagDocument> { }

const HashtagModel = new Schema<IHashtagDocument, IHashtagModel>({
  _id: { type: String, default: () => uuidv4() },
  tag_name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  post_count: { type: Number, default: 0, min: 0, required: true },
}, {
  timestamps: true,
  _id: false
});

HashtagModel.index({ tag_name: 1 });
HashtagModel.index({ post_count: -1 });

export default mongoose.model<IHashtagDocument, IHashtagModel>('Hashtag', HashtagModel);