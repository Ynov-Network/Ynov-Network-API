import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Like extends Document {
  _id: Types.ObjectId;
  post_id: Types.ObjectId;
  user_id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<Like, Model<Like>>({
  post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });
likeSchema.index({ post_id: 1 });
likeSchema.index({ user_id: 1 });

export default model<Like>('Like', likeSchema);