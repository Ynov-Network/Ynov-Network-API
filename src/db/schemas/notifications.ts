import { Schema, model, type Document, type Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Notification extends Document {
  recipient_id: string;
  actor_id?: string;
  type: string;
  content?: string;
  target_entity_id?: string;
  target_entity_type?: 'Post' | 'Comment' | 'User' | 'Like' | string;
  target_entity_ref?: string;
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<Notification, Model<Notification>>({
  _id: { type: String, default: () => uuidv4() },
  recipient_id: { type: String, ref: 'User', required: true },
  actor_id: { type: String, ref: 'User', default: null },
  type: { type: String, required: true },
  content: { type: String },
  target_entity_id: { type: String },
  target_entity_type: { type: String, enum: ['Post', 'Comment', 'User', 'Like'] },
  target_entity_ref: { type: String, refPath: 'target_entity_type' },
  is_read: { type: Boolean, default: false, required: true },
}, {
  timestamps: true,
  _id: false
});

notificationSchema.index({ recipient_user_id: 1, is_read: 1, timestamp: -1 });
notificationSchema.index({ recipient_user_id: 1, timestamp: -1 });

export default model<Notification>('Notification', notificationSchema);