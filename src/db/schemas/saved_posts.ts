import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface SavedPost extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  post_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const savedPostSchema = new Schema<SavedPost, Model<SavedPost>>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
  versionKey: false,
});

savedPostSchema.index({ user_id: 1, post_id: 1 }, { unique: true });
savedPostSchema.index({ user_id: 1, created_at: -1 });

export default model<SavedPost>('SavedPost', savedPostSchema); 