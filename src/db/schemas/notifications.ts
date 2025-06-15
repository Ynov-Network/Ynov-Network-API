import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface Notification extends Document {
  _id: Types.ObjectId;
  recipient_id: Types.ObjectId;
  actor_id?: Types.ObjectId;
  type: string;
  content?: string;
  target_entity_id?: Types.ObjectId;
  target_entity_type?: 'Post' | 'Comment' | 'User' | 'Like' | string;
  target_entity_ref?: Types.ObjectId;
  is_read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<Notification, Model<Notification>>({
  recipient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actor_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, required: true },
  content: { type: String },
  target_entity_id: { type: Schema.Types.ObjectId },
  target_entity_type: { type: String },
  target_entity_ref: { type: String },
  is_read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient_id: 1, createdAt: -1 });
notificationSchema.index({ recipient_id: 1, is_read: 1 });

export default model<Notification>('Notification', notificationSchema);