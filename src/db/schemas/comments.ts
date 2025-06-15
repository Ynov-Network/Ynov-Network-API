import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Comment extends Document {
  _id: Types.ObjectId;
  post_id: Types.ObjectId;
  author_id: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<Comment, Model<Comment>>({
  post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
}, {
  timestamps: true,
});

commentSchema.index({ post_id: 1, createdAt: 1 });
commentSchema.index({ author_id: 1 });

export default model<Comment>('Comment', commentSchema);