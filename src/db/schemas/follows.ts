import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Follow extends Document {
  follower_id: string; 
  following_id: string; 
}

const followSchema = new Schema<Follow, Model<Follow>>({
  _id: { type: String, default: () => uuidv4() },
  follower_id: { type: String, ref: 'User', required: true },
  following_id: { type: String, ref: 'User', required: true },
}, {
  timestamps: true, 
  _id: false,
  versionKey: false,
});

followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });
followSchema.index({ follower_id: 1 });
followSchema.index({ following_id: 1 });

export default model<Follow>('Follow', followSchema);