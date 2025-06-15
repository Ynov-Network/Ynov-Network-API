import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Hashtag extends Document {
  _id: Types.ObjectId;
  tag_name: string;
  post_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const hashtagSchema = new Schema<Hashtag, Model<Hashtag>>({
  tag_name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  post_count: { type: Number, default: 0, min: 0, required: true },
}, {
  timestamps: true,
});

hashtagSchema.index({ post_count: -1 });

export default model<Hashtag>('Hashtag', hashtagSchema);