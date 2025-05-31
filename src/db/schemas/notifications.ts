import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface INotification {
  recipient_user_id: string;
  triggering_user_id?: string;
  type: string;
  content?: string;
  target_entity_id?: string;
  target_entity_type?: 'Post' | 'Comment' | 'User' | string;
  target_entity_ref?: string;
  is_read: boolean;
  timestamp: Date;
}

export interface INotificationDocument extends INotification, Document { }

export interface INotificationModel extends Model<INotificationDocument> { }

const NotificationModel = new Schema<INotificationDocument, INotificationModel>({
  _id: { type: String, default: () => uuidv4() },
  recipient_user_id: { type: String, ref: 'User', required: true },
  triggering_user_id: { type: String, ref: 'User', default: null },
  type: { type: String, required: true },
  content: { type: String },
  target_entity_id: { type: String },
  target_entity_type: { type: String, enum: ['Post', 'Comment', 'User'] },
  target_entity_ref: { type: String, refPath: 'target_entity_type' },
  is_read: { type: Boolean, default: false, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
}, {
  timestamps: true,
  _id: false
});

NotificationModel.index({ recipient_user_id: 1, is_read: 1, timestamp: -1 });
NotificationModel.index({ recipient_user_id: 1, timestamp: -1 });

export default mongoose.model<INotificationDocument, INotificationModel>('Notification', NotificationModel);