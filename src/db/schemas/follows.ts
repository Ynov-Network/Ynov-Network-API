import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Follow extends Document {
  _id: Types.ObjectId;
  follower_id: Types.ObjectId;
  following_id: Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<Follow, Model<Follow>>({
  follower_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  following_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'accepted', required: true },
}, {
  timestamps: true,
  versionKey: false,
});

followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });
followSchema.index({ follower_id: 1 });
followSchema.index({ following_id: 1 });

export default model<Follow>('Follow', followSchema);