import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Hashtag extends Document {
  tag_name: string;
  post_count: number;
}

const hashtagSchema = new Schema<Hashtag, Model<Hashtag>>({
  _id: { type: String, default: () => uuidv4() },
  tag_name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  post_count: { type: Number, default: 0, min: 0, required: true },
}, {
  timestamps: true,
  _id: false
});

hashtagSchema.index({ post_count: -1 });

export default model<Hashtag>('Hashtag', hashtagSchema);